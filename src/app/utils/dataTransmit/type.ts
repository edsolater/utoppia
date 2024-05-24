export interface TransmitRule {
  canEncode?: (data: any) => boolean
  encode?: (data: any) => any
  canDecode?: (data: any) => boolean
  decode?: (data: any) => any
}
