interface BenchmarkCase {
  /** The name of the case. This is passed to several of the callbacks. */
  name: string
  /** The synchronous or asynchronous function that will be executed and measured. */
  f: () => Promise<void> | void
  /** Callback invoked once before any iterations of a case. */
  setup?: () => Promise<void>
  /** Callback invoked once after all iterations of a case have run. */
  teardown?: () => Promise<void>
}

const Benchmark = ({
  cycle,
  iteration,
  iterations = 1000,
  setup,
  teardown,
}: {
  /** Callback invoked after all iterations of a case are run. */
  cycle?: (
    name: string,
    stats: {
      /** The mean number of milliseconds of an iteration of this case. */
      mean: number
    },
  ) => void
  /** Callback invoked after a single iteration of a case is run. */
  iteration?: (
    name: string,
    stats: {
      /** The index of the current iteration. */
      i: number
      /** The number of milliseconds of this iteration. */
      ms: number
      /** The running mean number of milliseconds of all iterations so far. */
      mean: number
    },
  ) => void
  /** Total number of iterations to run in each case. */
  iterations?: number
  /** Global setup called once at the start of run. */
  setup?: () => void
  /** Global teardown called once at the end of run. */
  teardown?: () => void
} = {}) => {
  const cases: BenchmarkCase[] = []
  let totalms = 0

  return {
    clear: () => {
      cases.length = 0
    },
    add: (name: string, f: () => Promise<void>, setup?: () => Promise<void>) => {
      cases.push({ name, f, setup })
    },
    run: async () => {
      await setup?.()
      for (let i = 0; i < cases.length; i++) {
        const { name, f, setup, teardown } = cases[i]
        setup?.()
        for (let j = 0; j < iterations; j++) {
          const start = performance.now()
          await Promise.resolve(f())
          const end = performance.now()
          const ms = end - start
          totalms += ms
          iteration?.(name, { i: j, ms, mean: totalms / j })
        }
        teardown?.()
        cycle?.(name, { mean: totalms / iterations })
      }
      await teardown?.()
    },
  }
}

export default Benchmark