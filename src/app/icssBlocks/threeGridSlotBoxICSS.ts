export const threeGridSlotBoxICSS = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  alignItems: "center",
  "& > :nth-child(1)": { justifySelf: "start" },
  "& > :nth-child(2)": { justifySelf: "center" },
  "& > :nth-child(3)": { justifySelf: "end" },
}
