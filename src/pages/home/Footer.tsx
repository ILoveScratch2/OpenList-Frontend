import { Anchor, VStack } from "@hope-ui/solid"

export const Footer = () => {
  return (
    <VStack class="footer" w="$full" py="$4">
      <Anchor href="https://github.com/OpenListTeam/OpenList" external>
        Powered By OpenList, Modified by ILoveScratch2
      </Anchor>
    </VStack>
  )
}
