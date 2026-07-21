export const KMP_ARTICLE_META = Object.freeze({
  slug: 'kmp-three-platform-performance',
  title:
    'Kotlin Multiplatform 三端高频数据 Core：iOS、Android 与 HarmonyOS 的性能实测与工程选型',
  description:
    '基于 iOS、Android 与 HarmonyOS 真机数据，分析共享 KMP Core 的性能、内存、调用边界与工程选型。',
  publishedAt: '2026-07-21',
});

export const KMP_SCENARIO = Object.freeze({
  version: 'realtime-table-v1',
  rows: 5000,
  columns: 50,
  visibleRows: 34,
  prefetchDistance: 17,
  commands: 510,
  steadyBatchCount: 300,
  burstBatchCount: 200,
  steadyBatchesPerSecond: 20,
  burstBatchesPerSecond: 100,
  maximumFieldsPerBatch: 816,
});

export const IOS_ENVIRONMENT = Object.freeze({
  device: 'iPhone 17 Pro Max',
  model: 'iPhone18,2',
  system: 'iOS 26.5.1（Build 23F81）',
  configuration: 'Release',
  runsPerLane: 5,
});

export const IOS_RESULTS = Object.freeze([
  Object.freeze({
    id: 'swift-native',
    label: 'Swift 原生',
    scheme: 'native',
    steadyMedianMs: 0.021,
    steadyP95Ms: 0.026,
    burstP99Ms: 0.028,
    steadyBatchesPerSecond: 44707.62,
    burstBatchesPerSecond: 45731.41,
    peakMemoryMiB: 130.47,
  }),
  Object.freeze({
    id: 'official-framework',
    label: '官方 KMP Framework',
    scheme: 'kmp',
    steadyMedianMs: 0.096,
    steadyP95Ms: 0.107,
    burstP99Ms: 0.115,
    steadyBatchesPerSecond: 10227.83,
    burstBatchesPerSecond: 10268.18,
    peakMemoryMiB: 148.53,
  }),
  Object.freeze({
    id: 'c-abi',
    label: 'KMP C ABI',
    scheme: 'optimized',
    steadyMedianMs: 0.084,
    steadyP95Ms: 0.094,
    burstP99Ms: 0.103,
    steadyBatchesPerSecond: 11695.5,
    burstBatchesPerSecond: 11699.4,
    peakMemoryMiB: 136.7,
  }),
]);

export const ANDROID_ENVIRONMENT = Object.freeze({
  device: 'Redmi K20 Pro',
  system: 'Android 11',
  configuration: 'Release',
  runsPerLane: 5,
});

export const ANDROID_RESULTS = Object.freeze([
  Object.freeze({
    id: 'native-kotlin',
    label: '原生 Kotlin',
    scheme: 'native',
    steadyP95Ms: 0.206,
    burstP99Ms: 0.239,
    steadyBatchesPerSecond: 6935,
    burstBatchesPerSecond: 6927,
    peakPssMiB: 119.22,
  }),
  Object.freeze({
    id: 'kmp-jvm',
    label: 'KMP/JVM',
    scheme: 'kmp',
    steadyP95Ms: 0.118,
    burstP99Ms: 0.176,
    steadyBatchesPerSecond: 9343,
    burstBatchesPerSecond: 9109,
    peakPssMiB: 137.43,
  }),
]);

export const HARMONY_ENVIRONMENT = Object.freeze({
  device: 'Mate 60 Pro',
  system: 'HarmonyOS 6.x / OpenHarmony 6.1.0.115',
  configuration: 'Release',
});

export const HARMONY_RESULTS = Object.freeze({
  fullProcess: Object.freeze([
    Object.freeze({
      id: 'arkts',
      label: 'ArkTS 原生',
      scheme: 'native',
      peakPssMiB: 247.08,
    }),
    Object.freeze({
      id: 'knoi-before',
      label: 'KMP/KNOI 优化前',
      scheme: 'kmp',
      peakPssMiB: 539.6,
    }),
    Object.freeze({
      id: 'knoi-after',
      label: 'KMP/KNOI 优化后',
      scheme: 'kmp',
      peakPssMiB: 405.4,
    }),
    Object.freeze({
      id: 'cpf',
      label: 'CPF-KMP + AKInterop',
      scheme: 'optimized',
      peakPssMiB: 83.39,
    }),
  ]),
  arkts: Object.freeze({
    peakPssMiB: 247.08,
    steadyPeakPssMiB: 88.2,
    stressPeakPssMiB: 88.85,
  }),
  knoiBefore: Object.freeze({
    peakPssMiB: 539.6,
  }),
  knoiAfter: Object.freeze({
    durationMinutes: 33.2,
    totalBatches: 78220,
    totalFieldChanges: 63827520,
    steadyBatchesPerSecond: 19.98,
    stressBatchesPerSecond: 99.92,
    steadyPeakPssMiB: 382.82,
    stressPeakPssMiB: 405.4,
    peakPssMiB: 405.4,
    recoveryPssMiB: 384.62,
    maximumBacklog: 0,
  }),
  cpfProbe: Object.freeze({
    durationMinutes: 7,
    cpfPeakPssMiB: 104.82,
    knoiPeakPssMiB: 373.11,
    reductionPercent: 71.91,
  }),
  cpf: Object.freeze({
    durationMinutes: 31.3,
    samples: 1802,
    totalBatches: 76820,
    totalFieldChanges: 62685120,
    steadyBatchesPerSecond: 19.98,
    stressBatchesPerSecond: 99.94,
    initialPssMiB: 72.13,
    steadyPeakPssMiB: 71.41,
    stressPeakPssMiB: 83.39,
    stopStartPssMiB: 76.97,
    peakPssMiB: 83.39,
    recoveryPssMiB: 45.58,
    maximumBacklog: 0,
  }),
});

export const CPF_TOOLCHAIN = Object.freeze([
  Object.freeze({ name: 'Kotlin Gradle Plugin', version: '2.2.21-0.4.0-08' }),
  Object.freeze({ name: 'CPF Kotlin 源码标签', version: 'v2.2.21-0.4.0' }),
  Object.freeze({ name: 'Gradle', version: '8.9' }),
  Object.freeze({ name: 'AKInterop Gradle Plugin', version: '0.0.1' }),
  Object.freeze({ name: 'AKInterop KSP', version: '2.2.21-2.0.4' }),
]);

export const TECH_REFERENCES = Object.freeze([
  Object.freeze({
    label: 'CPF-KMP Kotlin',
    url: 'https://gitcode.com/CPF-KMP-CMP/kotlin.git',
    revision: '0df42d4f7eaff2f1a5a0f763de4ababc875992f2',
  }),
  Object.freeze({
    label: 'AKInterop',
    url: 'https://gitcode.com/CPF-KMP-CMP/akinterop.git',
    revision: 'b8b80eaa44b84bc84ee883a2c86224c07fbf2a11',
  }),
  Object.freeze({
    label: 'KuiklyBase',
    url: 'https://github.com/Tencent-TDS/KuiklyBase-platform',
    revision: '公开仓库',
  }),
  Object.freeze({
    label: 'KNOI',
    url: 'https://github.com/Tencent-TDS/KuiklyBase-components/tree/master/knoi',
    revision: '公开仓库',
  }),
]);

export const PLATFORM_SELECTIONS = Object.freeze([
  Object.freeze({
    platform: 'Android',
    defaultChannel: 'KMP/JVM 直接 API',
    highFrequencyChannel: '同一直接 API + 批量结构',
    selection: '直接使用共享 Core',
  }),
  Object.freeze({
    platform: 'iOS',
    defaultChannel: '官方 Kotlin/Native Framework',
    highFrequencyChannel: '同一 Core 的 C ABI + Swift Adapter',
    selection: 'Framework 与 C ABI 双通道',
  }),
  Object.freeze({
    platform: 'HarmonyOS',
    defaultChannel: 'CPF-KMP 普通接口',
    highFrequencyChannel: 'AKInterop/N-API Direct ArrayBuffer',
    selection: 'CPF-KMP 直接缓冲区通道',
  }),
]);

export function barPercent(value, maximum) {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (value / maximum) * 100));
}
