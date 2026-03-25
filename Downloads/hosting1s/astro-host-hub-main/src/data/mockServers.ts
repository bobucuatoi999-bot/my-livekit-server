export interface Server {
  id: string
  name: string
  ip: string
  status: 'online' | 'offline'
  ram: string
  cpu: string
  disk: string
}

export const mockServers: Server[] = [
  { id:'1', name:'VPS Ubuntu 24.04',  ip:'103.80.150.32', status:'online',  ram:'4 GB', cpu:'2 vCPU', disk:'80 GB SSD'  },
  { id:'2', name:'Minecraft Server',  ip:'103.80.150.45', status:'online',  ram:'8 GB', cpu:'4 vCPU', disk:'100 GB SSD' },
  { id:'3', name:'Database Replica',  ip:'103.80.150.67', status:'offline', ram:'2 GB', cpu:'1 vCPU', disk:'40 GB SSD'  },
]
