export interface PodMetadata {
  name: string,
  namespace: string
}

export interface Pod {
  kind: string
  metadata: PodMetadata
}
export interface GetPodResponse {
  items: Array<Pod>
}