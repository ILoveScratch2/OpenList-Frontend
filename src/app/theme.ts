import { globalCss, HopeThemeConfig } from "@hope-ui/solid"
import { hoverColor } from "~/utils"

const theme: HopeThemeConfig = {
  initialColorMode: "system",
  lightTheme: {
    colors: {
      // background: "$neutral2",
      background: "#f7f8fa",
    },
  },
  components: {
    Button: {
      baseStyle: {
        root: {
          rounded: "20px",
          _active: {
            transform: "scale(.97)",
            transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          _hover: {
            boxShadow:
              "0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)",
            transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          _focus: {
            boxShadow: "unset",
          },
          transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
      defaultProps: {
        root: {
          colorScheme: "info",
          variant: "subtle",
        },
      },
    },
    IconButton: {
      defaultProps: {
        colorScheme: "info",
        variant: "subtle",
      },
    },
    Input: {
      baseStyle: {
        input: {
          rounded: "16px",
          _focus: {
            boxShadow: "unset",
            borderColor: "$info8",
          },
          transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
      defaultProps: {
        input: {
          variant: "filled",
        },
      },
    },
    Textarea: {
      baseStyle: {
        rounded: "16px",
        _focus: {
          boxShadow: "unset",
          borderColor: "$info8",
        },
        resize: "vertical",
        wordBreak: "break-all",
        transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      defaultProps: {
        variant: "filled",
      },
    },
    Select: {
      baseStyle: {
        trigger: {
          rounded: "16px",
          _focus: {
            boxShadow: "unset",
            borderColor: "$info8",
          },
          transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        content: {
          border: "none",
          rounded: "12px",
          boxShadow:
            "0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3)",
        },
        optionIndicator: {
          color: "$info10",
        },
      },
      defaultProps: {
        root: {
          variant: "filled",
        },
      },
    },
    Checkbox: {
      defaultProps: {
        root: {
          colorScheme: "info",
          variant: "filled",
        },
      },
    },
    Switch: {
      defaultProps: {
        root: {
          colorScheme: "info",
        },
      },
    },
    Menu: {
      baseStyle: {
        content: {
          rounded: "12px",
          minW: "unset",
          border: "unset",
          boxShadow:
            "0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3)",
          // py: "0",
        },
        item: {
          rounded: "8px",
          py: "$1",
          transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          // mx: "0",
        },
      },
    },
    Notification: {
      baseStyle: {
        root: {
          rounded: "16px",
          border: "unset",
          boxShadow:
            "0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    Alert: {
      baseStyle: {
        root: {
          rounded: "16px",
          boxShadow:
            "0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    Anchor: {
      baseStyle: {
        rounded: "20px",
        px: "$1_5",
        py: "$1",
        _hover: {
          bgColor: hoverColor(),
          textDecoration: "none",
        },
        _focus: {
          boxShadow: "unset",
        },
        _active: {
          transform: "scale(.97)",
          transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
    Modal: {
      baseStyle: {
        content: {
          rounded: "28px",
          boxShadow:
            "0 8px 12px 6px rgba(0, 0, 0, 0.15), 0 4px 4px rgba(0, 0, 0, 0.3)",
        },
      },
    },
  },
}

export const globalStyles = globalCss({
  "*": {
    margin: 0,
    padding: 0,
  },
  html: {
    fontFamily: `-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol" !important`,
  },
  "#root": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  ".hope-breadcrumb__list": {
    flexWrap: "wrap",
    rowGap: "0 !important",
  },
  ".lightgallery-container": {
    "& .lg-backdrop": {
      zIndex: "$popover",
    },
    "& .lg-outer": {
      zIndex: "calc($popover + 10)",
    },
  },
  ".viselect-selection-area": {
    background: "rgba(46, 115, 252, 0.11)",
    border: "2px solid rgba(98, 155, 255, 0.81)",
    borderRadius: "0.1em",
  },
  ".viselect-container": {
    userSelect: "none",
    "& .viselect-item": {
      "-webkit-user-drag": "none",
      "& img": {
        "-webkit-user-drag": "none",
      },
    },
  },
})

export { theme }
