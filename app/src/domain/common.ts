export type UnavailableReason =
  | "deleted"
  | "loading"
  | "unauthorized"
  | "unavailable"
export type NotLoaded = {
  $loadingState: UnavailableReason
  $isLoaded: false
}
export type Loaded<T> = T & {
  $loadingState: "loaded"
  $isLoaded: true
}
export type Maybe<T> = Loaded<T> | NotLoaded

export const Maybe = {
  of<T>(value: T): Loaded<T> {
    return Object.assign(value as object, {
      $loadingState: "loaded" as const,
      $isLoaded: true as const,
    }) as Loaded<T>
  },
  notLoaded(reason: UnavailableReason): NotLoaded {
    return { $loadingState: reason, $isLoaded: false }
  },
  loading(): NotLoaded {
    return { $loadingState: "loading", $isLoaded: false }
  },
  unavailable(): NotLoaded {
    return { $loadingState: "unavailable", $isLoaded: false }
  },
  unauthorized(): NotLoaded {
    return { $loadingState: "unauthorized", $isLoaded: false }
  },
}
