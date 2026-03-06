//统一管理咱们项目用户相关的接口
import request from '@/utils/request'

import type {
  IpReqData,
  IpInfo,
  getIpResponseData
} from './type'

//项目用户相关的请求地址

enum API {
  //获取ip
  GET_IP = '/openapi/ip'
}

// 统一的IP信息接口
interface IpProvider {
  getIpInfo(ip: string): Promise<IpInfo>
}

// IPinfo.io 实现
class IpInfoProvider implements IpProvider {
  async getIpInfo(ip: string): Promise<IpInfo> {
    const response = await fetch(`https://ipinfo.io/${ip}/json`)
    if (!response.ok) {
      throw new Error('IPinfo.io API 请求失败')
    }
    const data = await response.json()
    return {
      ip: data.ip,
      pos: `${data.city}, ${data.region}, ${data.country}`,
      isp: data.org || '未知',
      city: data.city,
      country: data.country,
      region: data.region,
      timezone: data.timezone,
      organization: data.org
    }
  }
}



// ip-api.com 实现
class IpApiProvider implements IpProvider {
  async getIpInfo(ip: string): Promise<IpInfo> {
    const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`)
    if (!response.ok) {
      throw new Error('ip-api.com API 请求失败')
    }
    const data = await response.json()
    if (data.status !== 'success') {
      throw new Error('ip-api.com API 请求失败: ' + data.message)
    }
    return {
      ip: data.query || ip,
      pos: `${data.regionName} ${data.city}`,
      isp: data.isp || '未知',
      city: data.city,
      country: data.country,
      region: data.regionName,
      timezone: data.timezone,
      organization: data.org,
      asn: data.as,
      latitude: data.lat,
      longitude: data.lon
    }
  }
}

// ip.sb 实现
class IpSbProvider implements IpProvider {
  async getIpInfo(ip: string): Promise<IpInfo> {
    const response = await fetch(`https://api.ip.sb/geoip/${ip}`)
    if (!response.ok) {
      throw new Error('ip.sb API 请求失败')
    }
    const data = await response.json()
    return {
      ip: data.ip || ip,
      pos: data.country || '未知',
      isp: data.isp || data.organization || '未知',
      country: data.country,
      timezone: data.timezone,
      organization: data.organization || data.asn_organization,
      asn: data.asn.toString(),
      latitude: data.latitude,
      longitude: data.longitude
    }
  }
}

// 数据源映射
const providers: Record<string, IpProvider> = {
  'ipinfo': new IpInfoProvider(),
  'ipapi': new IpApiProvider(),
  'ipsb': new IpSbProvider()
}

// 获取ip
export const getIp = (data: IpReqData & { provider?: string }) => request.post<any, getIpResponseData>(API.GET_IP, data)

// 根据数据源获取IP信息
export const getIpByProvider = async (ip: string, provider: string): Promise<IpInfo> => {
  if (!providers[provider]) {
    throw new Error('不支持的数据源')
  }
  return providers[provider].getIpInfo(ip)
}

// 数据源列表
export const ipProviders = [
  { value: 'ipinfo', label: 'IPinfo.io' },
  { value: 'ipapi', label: 'ip-api.com' },
  { value: 'ipsb', label: 'ip.sb' }
]