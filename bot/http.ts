import axios from 'axios'
import type { Bhttp } from '../types'

export default function createHttp(url: string) {
  const http = axios.create({
    baseURL: url,
    method: 'POST',
  })

  const hh: Bhttp = {
    async send(action: string, params: any) {
      const { data } = await http({
        url: action,
        data: params,
      })
      return data
    },
  }
  return hh
}
