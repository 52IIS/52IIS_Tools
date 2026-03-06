import { ResponseData } from "../common"

export interface IpReqData {
  ip: string
}

export interface IpInfo {
  ip: string,
  pos: string,
  isp: string,
  city?: string,
  country?: string,
  region?: string,
  timezone?: string,
  asn?: string,
  organization?: string,
  latitude?: number,
  longitude?: number
}

//响应格式
export interface getIpResponseData extends ResponseData {
  data: IpInfo
}