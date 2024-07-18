import { Box, Text } from "@edsolater/pivkit"

export function AppLogo(props: {}) {
  return (
    <Box
      icss={{
        display: "flex",
        gap: "64px",
      }}
    >
      <Text
        icss={{
          fontSize: "36px",
          fontWeight: "800",
        }}
      >
        Uttopia
      </Text>
      {/* <Piv shadowProps={{ children: props.title }} /> */}
    </Box>
  )
}
