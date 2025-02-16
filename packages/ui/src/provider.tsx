"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "@repo/ui/color-mode"
import { Toaster } from "./toaster"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <Toaster />
      <ColorModeProvider forcedTheme="dark" {...props} />
    </ChakraProvider>
  )
}
