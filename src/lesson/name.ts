export const NAME_STORAGE_KEY = 'jlpt-dojo/name/v1'

type ReadableStorage = Pick<Storage, 'getItem'>
type WritableStorage = Pick<Storage, 'setItem'>

/** The user's display name, shown as a greeting. Purely cosmetic — no account or sync is tied to it. */
export function loadName(storage: ReadableStorage): string | null {
  return storage.getItem(NAME_STORAGE_KEY)
}

export function saveName(storage: WritableStorage, name: string): void {
  storage.setItem(NAME_STORAGE_KEY, name)
}
