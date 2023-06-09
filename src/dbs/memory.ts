import Database from '../types/Database'

let cache: {
  [key: string]: {
    [key: string | number]: any
  }
} = {}

const runner: Database = {
  clear: async () => {
    cache = {}
  },
  createStore: async storeNames => {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames]
    names.forEach(name => {
      cache[name] = {}
    })
  },
  get: async (storeName, key) => {
    return cache[storeName][key]
  },
  getAll: async storeName => {
    return Object.values(cache[storeName])
  },
  bulkGet: async (storeNames, keys, values) => {
    return keys.map((key, i) => {
      const storeName = Array.isArray(storeNames) ? storeNames[i] : storeNames
      return cache[storeName][keys[i]]
    })
  },
  set: async (storeName, key, value) => {
    cache[storeName][key] = value
  },
  bulkSet: async (storeNames, keys, values) => {
    keys.forEach((_, i) => {
      const storeName = Array.isArray(storeNames) ? storeNames[i] : storeNames
      cache[storeName][keys[i]] = values[i]
    })
  },
}

export default runner
