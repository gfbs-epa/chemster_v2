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

export type PropertyValue = {
  dtxsid: string,
  value: number,
  name: string,
  source: string,
  unit: string
}

export type CTXProperty = {
  name: string,
  value: number,
  id: number,
  propertyId: string,
  propType: string,
  source: string,
  description: string,
  dtxsid: string,
  dtxcid: string,
  unit: string
}

export type CTXChemical = {
  dtxsid: string,
  dtxcid: string,
  preferredName: string,
  casrn: string,
  monoisotopicMass: number,
  molFormula: string,
  inchikey: string,
  smiles: string,
  msReadySmiles: string
  cpdataCount: number,
  activeAssays: number,
  percentAssays: number,
  expocatMedianPrediction: string,
  expocat: string,
  nhanes: string,
  sourcesCount: number,
  totalAssays: number,
}

export type CTXList = {
  id: number,
  listName: string,
  shortDescription: string,
  longDescription: string,
  type: string,
  visibility: string,
  createdAt: string,
  chemicalCount: number,
  updatedAt: string,
  label: string
}

export type DashboardListItem = {
  title: string,
  value: string,
  props: { subtitle: string }
}