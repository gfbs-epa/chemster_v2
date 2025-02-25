export type Credentials = { 
  username: string, 
  password: string 
}

export type Tokens = { 
  access_token: string, 
  refresh_token: string 
}

export type Collection = { 
  id: number, 
  name: string, 
  super_id: number, 
  owner_id: number 
}

export type Chemical = {
  dtxsid: string
}