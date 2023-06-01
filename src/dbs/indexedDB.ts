import Database from '../types/Database'

const dbname = 'test'
let dbversion = 1

const runner: Database = {
  /** Clears all databases. */
  clear: async (): Promise<void> => {
    dbversion = 1
    const dbs = await indexedDB.databases()
    for (let i = 0; i < dbs.length; i++) {
      const name = dbs[i]?.name
      if (name) {
        await indexedDB.deleteDatabase(name)
      } else {
        console.error('Unable to delete database.', dbs)
      }
    }
  },

  /** Gets a value at a key from a store. */
  get: (storeName: string, key: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(dbname)
      openRequest.onerror = console.error
      openRequest.onsuccess = (e: any) => {
        const db: IDBDatabase = e.target.result
        const tx = db.transaction(storeName, 'readonly')
        const store = tx.objectStore(storeName)
        const getRequest = store.get(key)
        getRequest.onerror = console.error
        getRequest.onsuccess = () => {
          db.close()
          resolve(getRequest.result)
        }
      }
    })
  },

  /** Creates a new store. */
  createStore: async (storeName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(dbname, dbversion++)
      openRequest.onerror = console.error
      openRequest.onupgradeneeded = (e: any) => {
        const db: IDBDatabase = e.target.result
        db.createObjectStore(storeName)
      }
      openRequest.onsuccess = (e: any) => {
        const db: IDBDatabase = e.target.result
        db.close()
        resolve()
      }
    })
  },

  /** Sets a value in a new random object store. */
  set: async (storeName: string, key: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(dbname)
      openRequest.onerror = console.error
      openRequest.onsuccess = (e: any) => {
        const db: IDBDatabase = e.target.result
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)

        // add
        const addRequest = store.add(key, value)
        addRequest.onerror = console.error
        addRequest.onsuccess = () => {
          const db: IDBDatabase = e.target.result
          db.close()
          resolve()
        }
      }
    })
  },
}

export default runner
