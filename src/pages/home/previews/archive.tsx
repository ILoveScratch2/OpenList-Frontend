import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  VStack,
  Text,
  Divider,
  HStack,
  Icon,
  useColorMode,
  Button,
} from "@hope-ui/solid"
import { Motion } from "solid-motionone"
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  Show,
  Switch,
  Suspense,
} from "solid-js"
import {
  getMainColor,
  local,
  me,
  OrderBy,
  password,
  ObjStore,
  objStore,
} from "~/store"
import { Obj, ObjTree, UserMethods, UserPermissions } from "~/types"
import { useFetch, useRouter, useT, useUtil } from "~/hooks"
import { ListTitle } from "~/pages/home/folder/List"
import { cols } from "~/pages/home/folder/ListItem"
import { Error, FullLoading, MaybeLoading } from "~/components"
import {
  bus,
  encodePath,
  formatDate,
  fsArchiveList,
  fsArchiveMeta,
  getFileSize,
  hoverColor,
} from "~/utils"
import naturalSort from "typescript-natural-sort"
import Password from "~/pages/home/Password"
import { useSelectWithMouse } from "~/pages/home/folder/helper"
import { getIconByObj } from "~/utils/icon"
import createMutex from "~/utils/mutex"
import { Item, Menu, useContextMenu } from "solid-contextmenu"
import { TbCopy, TbLink, TbArrowLeft } from "solid-icons/tb"
import { AiOutlineCloudDownload } from "solid-icons/ai"
import { Operations } from "~/pages/home/toolbar/operations"
import File from "../file/File"
import "solid-contextmenu/dist/style.css"

type ListItemProps = {
  obj: Obj
  index: number
  onNavigate: () => void
  innerPath: string
  url?: string
  pass: string
}

const ListItem = (props: ListItemProps) => {
  const { show } = useContextMenu({ id: 2 })
  const { isMouseSupported } = useSelectWithMouse()
  const filenameStyle = () => local["list_item_filename_overflow"]
  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        width: "100%",
      }}
    >
      <HStack
        class="list-item viselect-item"
        data-index={props.index}
        w="$full"
        p="$2"
        rounded="$lg"
        transition="all 0.3s"
        _hover={{
          transform: "scale(1.01)",
          bgColor: hoverColor(),
        }}
        cursor={!isMouseSupported() ? "pointer" : "default"}
        on:click={(_: MouseEvent) => {
          props.onNavigate()
        }}
        onContextMenu={(e: MouseEvent) => {
          show(e, { props: props })
        }}
      >
        <HStack class="name-box" spacing="$1" w={cols[0].w}>
          <Icon
            class="icon"
            boxSize="$6"
            color={getMainColor()}
            as={getIconByObj(props.obj)}
            mr="$1"
          />
          <Text
            class="name"
            css={{
              wordBreak: "break-all",
              whiteSpace: filenameStyle() === "multi_line" ? "unset" : "nowrap",
              "overflow-x":
                filenameStyle() === "scrollable" ? "auto" : "hidden",
              textOverflow:
                filenameStyle() === "ellipsis" ? "ellipsis" : "unset",
              "scrollbar-width": "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
            title={props.obj.name}
          >
            {props.obj.name}
          </Text>
        </HStack>
        <Text class="size" w={cols[1].w} textAlign={cols[1].textAlign as any}>
          {getFileSize(props.obj.size)}
        </Text>
        <Text
          class="modified"
          display={{ "@initial": "none", "@md": "inline" }}
          w={cols[2].w}
          textAlign={cols[2].textAlign as any}
        >
          {formatDate(props.obj.modified)}
        </Text>
      </HStack>
    </Motion.div>
  )
}

const operations: Operations = {
  extract: { icon: TbCopy, color: "$success9" },
  copy_link: { icon: TbLink, color: "$info9" },
  download: { icon: AiOutlineCloudDownload, color: "$primary9" },
}

const ContextMenu = () => {
  const { copy } = useUtil()
  const { colorMode } = useColorMode()
  const { isShare } = useRouter()
  return (
    <Menu
      id={2}
      animation="scale"
      theme={colorMode() !== "dark" ? "light" : "dark"}
      style="z-index: var(--hope-zIndices-popover)"
    >
      <Item
        hidden={({ props }) => {
          return props.obj.is_dir
        }}
        onClick={({ props }) => {
          if (props.url) {
            window.open(props.url, "_blank")
          }
        }}
      >
        <ItemContent name="download" />
      </Item>
      <Item
        hidden={({ props }) => {
          return props.obj.is_dir
        }}
        onClick={({ props }) => {
          copy(props.url)
        }}
      >
        <ItemContent name="copy_link" />
      </Item>
      <Item
        hidden={() => {
          const index = UserPermissions.findIndex(
            (item) => item === "decompress",
          )
          return !isShare() && !UserMethods.can(me(), index)
        }}
        onClick={({ props }) => {
          bus.emit(
            "extract",
            JSON.stringify({ inner: props.innerPath, pass: props.pass }),
          )
        }}
      >
        <ItemContent name="extract" />
      </Item>
    </Menu>
  )
}

const ItemContent = (props: { name: string }) => {
  const t = useT()
  return (
    <HStack spacing="$2">
      <Icon
        p={operations[props.name].p ? "$1" : undefined}
        as={operations[props.name].icon}
        boxSize="$7"
        color={operations[props.name].color}
      />
      <Text>{t(`home.toolbar.${props.name}`)}</Text>
    </HStack>
  )
}

type List = {
  [name: string]: Obj & { children: List | null }
}

const Preview = () => {
  const t = useT()
  const { pathname } = useRouter()
  const [metaLoading, fetchMeta] = useFetch(fsArchiveMeta)
  const [listLoading, fetchList] = useFetch(fsArchiveList)
  const loading = createMemo(() => {
    return metaLoading() || listLoading()
  })
  let archive_pass = ""
  let raw_url = ""
  let sign = ""
  let list: List | null = null
  let originalObjStore: typeof objStore | null = null
  const [error, setError] = createSignal("")
  const [wrongPassword, setWrongPassword] = createSignal(false)
  const [requiringPassword, setRequiringPassword] = createSignal(false)
  const [comment, setComment] = createSignal("")
  const [innerPaths, setInnerPaths] = createSignal<string[]>([])
  const [previewingFile, setPreviewingFile] = createSignal<Obj | null>(null)
  const [orderBy, setOrderBy] = createSignal<OrderBy>()
  const [reverse, setReverse] = createSignal(false)
  const [extractFolder, setExtractFolder] = createSignal<"" | "front" | "back">(
    "",
  )
  const getObjsMutex = createMutex()
  const toList = (tree: ObjTree[] | Obj[]): List => {
    let l: List = {}
    tree.forEach((item: any) => {
      l[item.name] = {
        ...item,
        children: item.children ? toList(item.children) : null,
      }
    })
    return l
  }
  const dealWithError = (resp: { code: number; message: string }): boolean => {
    if (resp.code === 200) return false
    if (resp.code === 202) {
      batch(() => {
        if (archive_pass !== "") {
          setWrongPassword(true)
        }
        setRequiringPassword(true)
        setError("")
      })
    } else {
      setError(resp.message)
    }
    return true
  }
  const getObjs = async (innerPath: string[]) => {
    await getObjsMutex.acquire()
    if (requiringPassword() && archive_pass === "") {
      getObjsMutex.release()
      return []
    }
    if (raw_url === "") {
      const resp = await fetchMeta(pathname(), password(), archive_pass)
      if (dealWithError(resp)) {
        getObjsMutex.release()
        return []
      }
      if (resp.data.content !== null) {
        list = toList(resp.data.content)
      }
      raw_url = resp.data.raw_url
      sign = resp.data.sign
      setComment(resp.data.comment)
      if (resp.data.sort !== undefined) {
        let order: OrderBy | undefined = undefined
        if (resp.data.sort.order_by !== "") {
          order = resp.data.sort.order_by
        }
        let re = resp.data.sort.order_direction === "desc"
        let ef = resp.data.sort.extract_folder
        batch(() => {
          setOrderBy(order)
          setReverse(re)
          setExtractFolder(ef)
        })
      }
      if (resp.data.encrypted && archive_pass === "") {
        batch(() => {
          setRequiringPassword(true)
          setError("")
        })
        getObjsMutex.release()
        return []
      }
    }
    if (list === null) {
      const resp = await fetchList(pathname(), password(), archive_pass, "/")
      if (dealWithError(resp)) {
        getObjsMutex.release()
        return []
      }
      list = toList(resp.data.content)
    }
    let l = list
    for (let i = 0; i < innerPath.length; i++) {
      if (l[innerPath[i]].children === null) {
        const resp = await fetchList(
          pathname(),
          password(),
          archive_pass,
          "/" + innerPath.slice(0, i + 1).join("/"),
        )
        if (dealWithError(resp)) {
          getObjsMutex.release()
          return []
        }
        l[innerPath[i]].children = toList(resp.data.content)
      }
      l = l[innerPath[i]].children!
    }
    batch(() => {
      setRequiringPassword(false)
      setWrongPassword(false)
      setError("")
    })
    getObjsMutex.release()
    return Object.values(l)
  }
  const [objs, setObjs] = createSignal<Obj[]>([])
  createEffect(() => {
    getObjs(innerPaths()).then((ret) => setObjs(ret))
  })
  const refresh = () => {
    getObjs(innerPaths()).then((ret) => setObjs(ret))
  }
  refresh()
  const sortedObjs = () => {
    let ret = objs()
    if (orderBy()) {
      ret = ret.sort((a, b) => {
        return (reverse() ? -1 : 1) * naturalSort(a[orderBy()!], b[orderBy()!])
      })
    }
    let ef = extractFolder()
    if (ef !== "") {
      let dir: Obj[] = []
      let file: Obj[] = []
      ret.forEach((o) => (o.is_dir ? dir : file).push(o))
      ret = ef === "front" ? dir.concat(file) : file.concat(dir)
    }
    return ret
  }
  const sortObjs = (orderBy: OrderBy, reverse?: boolean) => {
    batch(() => {
      setExtractFolder("")
      setOrderBy(orderBy)
      if (reverse !== undefined) {
        setReverse(reverse)
      }
    })
  }
  const handleNavigate = (obj: Obj, innerPath: string, url?: string) => {
    if (obj.is_dir) {
      setInnerPaths(innerPaths().concat(obj.name))
      setPreviewingFile(null)
    } else {
      if (!originalObjStore) {
        originalObjStore = { ...objStore }
      }
      ObjStore.setObj(obj)
      ObjStore.setRawUrl(url || "")
      ObjStore.setProvider(objStore.provider)
      setPreviewingFile(obj)
    }
  }

  const handleBack = () => {
    if (originalObjStore) {
      ObjStore.setObj(originalObjStore.obj)
      ObjStore.setRawUrl(originalObjStore.raw_url)
      ObjStore.setProvider(originalObjStore.provider)
    }
    setPreviewingFile(null)
  }

  return (
    <VStack spacing="$2" w="$full">
      <Show when={!previewingFile()}>
        <Breadcrumb pl="$2" pr="$2" w="$full">
          <BreadcrumbItem>
            <BreadcrumbLink
              currentPage={innerPaths().length === 0}
              on:click={() => setInnerPaths([])}
            >
              .
            </BreadcrumbLink>
          </BreadcrumbItem>
          <For each={innerPaths()}>
            {(name, i) => (
              <BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbLink
                  currentPage={innerPaths().length === i() + 1}
                  on:click={() => setInnerPaths(innerPaths().slice(0, i() + 1))}
                >
                  {name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </For>
        </Breadcrumb>
      </Show>
      <Show when={previewingFile()}>
        <Button
          leftIcon={<TbArrowLeft />}
          onClick={handleBack}
          colorScheme="neutral"
          variant="subtle"
        >
          {t("global.back")}
        </Button>
        <Suspense fallback={<FullLoading />}>
          <File inArchive />
        </Suspense>
      </Show>
      <Show when={!previewingFile()}>
        <Switch>
          <Match when={error() !== ""}>
            <Error msg={error()} disableColor />
          </Match>
          <Match when={requiringPassword()}>
            <Password
              title={t("home.toolbar.archive.input_password")}
              password={() => archive_pass}
              setPassword={(s) => (archive_pass = s)}
              enterCallback={() => refresh()}
            >
              <Show when={wrongPassword()}>
                <Text color="$danger9">
                  {t("home.toolbar.archive.incorrect_password")}
                </Text>
              </Show>
            </Password>
          </Match>
          <Match when={!requiringPassword() && error() === ""}>
            <MaybeLoading loading={loading()}>
              <VStack class="list" w="$full" spacing="$1">
                <ListTitle sortCallback={sortObjs} disableCheckbox />
                <For each={sortedObjs()}>
                  {(obj, i) => {
                    let url = undefined
                    let innerPath =
                      (innerPaths().length > 0
                        ? "/" + innerPaths().join("/")
                        : "") +
                      "/" +
                      obj.name
                    if (!obj.is_dir) {
                      const hasQuery = raw_url.includes("?")
                      url =
                        raw_url +
                        `${hasQuery ? "&" : "?"}inner=${encodePath(innerPath, true)}`
                      if (archive_pass !== "") {
                        url = url + `&pass=${encodeURIComponent(archive_pass)}`
                      }
                      if (sign !== "") {
                        url = url + `&sign=${sign}`
                      }
                    }
                    return (
                      <ListItem
                        obj={obj}
                        index={i()}
                        onNavigate={() => handleNavigate(obj, innerPath, url)}
                        innerPath={innerPath}
                        url={url}
                        pass={archive_pass}
                      />
                    )
                  }}
                </For>
                <ContextMenu />
              </VStack>
            </MaybeLoading>
          </Match>
        </Switch>
        <Show when={comment() !== ""}>
          <Divider />
          <Text w="$full" pl="$1" pr="$1">
            {comment()}
          </Text>
        </Show>
      </Show>
    </VStack>
  )
}

export default Preview
