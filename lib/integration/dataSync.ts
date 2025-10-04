// Data synchronization system for health apps
import type {
  ConnectedApp,
  CrossAppData,
  DataSyncConfig,
  UnifiedHealthData,
  SkinTrackData,
  GastroGuardData,
  HealthHelperData,
  MindTrackData,
  SleepStressLoggerData,
} from "./types"

export class HealthDataSync {
  private connectedApps: ConnectedApp[] = []
  private syncConfigs: DataSyncConfig[] = []
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.loadConnectedApps()
      this.loadSyncConfigs()
    }
  }

  // App management
  addConnectedApp(app: ConnectedApp): void {
    const existingIndex = this.connectedApps.findIndex((a) => a.id === app.id)
    if (existingIndex >= 0) {
      this.connectedApps[existingIndex] = app
    } else {
      this.connectedApps.push(app)
    }
    this.saveConnectedApps()
  }

  removeConnectedApp(appId: string): void {
    this.connectedApps = this.connectedApps.filter((app) => app.id !== appId)
    this.syncConfigs = this.syncConfigs.filter((config) => config.appId !== appId)
    this.saveConnectedApps()
    this.saveSyncConfigs()
  }

  getConnectedApps(): ConnectedApp[] {
    return this.connectedApps
  }

  // Data synchronization
  async syncAllApps(): Promise<{ [appId: string]: { success: boolean; dataCount: number; error?: string } }> {
    const results: { [appId: string]: { success: boolean; dataCount: number; error?: string } } = {}

    for (const app of this.connectedApps) {
      if (app.status !== "connected") continue

      try {
        const dataCount = await this.syncAppData(app)
        results[app.id] = { success: true, dataCount }

        // Update last sync time
        app.lastSync = new Date().toISOString()
      } catch (error) {
        results[app.id] = {
          success: false,
          dataCount: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        }
        app.status = "error"
      }
    }

    this.saveConnectedApps()
    return results
  }

  private async syncAppData(app: ConnectedApp): Promise<number> {
    let totalDataCount = 0

    for (const dataType of app.dataTypes) {
      try {
        const data = await this.fetchDataFromApp(app, dataType)
        await this.storeCrossAppData(data)
        totalDataCount += data.length
      } catch (error) {
        console.error(`Failed to sync ${dataType} from ${app.id}:`, error)
      }
    }

    return totalDataCount
  }

  private async fetchDataFromApp(app: ConnectedApp, dataType: string): Promise<CrossAppData[]> {
    // This would integrate with the actual API client
    // For now, we'll simulate the data fetching
    const mockData = this.generateMockData(app.id, dataType)

    return mockData.map((item: any) => ({
      timestamp: item.date || new Date().toISOString(),
      sourceApp: app.id,
      dataType,
      data: item,
      metadata: {
        confidence: 1.0,
        processed: false,
        tags: [],
      },
    }))
  }

  private generateMockData(appId: string, dataType: string): any[] {
    const mockDataGenerators = {
      "skintrack-plus": {
        skin_condition: () => [
          {
            date: "2023-10-20",
            skinCondition: "mild_breakout",
            severity: 4,
            affectedAreas: ["forehead"],
            triggers: ["stress"],
            treatments: ["salicylic_acid"],
          },
          { date: "2023-10-21", skinCondition: "clear", severity: 1, affectedAreas: [], triggers: [], treatments: [] },
        ],
        breakouts: () => [{ date: "2023-10-20", type: "inflammatory", count: 3, severity: 4 }],
      },
      gastroguard: {
        symptoms: () => [
          {
            date: "2023-10-20",
            symptoms: { reflux: 6, bloating: 4, nausea: 2, stomachPain: 3, diarrhea: 0, constipation: 0 },
          },
          {
            date: "2023-10-21",
            symptoms: { reflux: 3, bloating: 2, nausea: 1, stomachPain: 1, diarrhea: 0, constipation: 0 },
          },
        ],
        meals: () => [
          { date: "2023-10-20", meals: [{ time: "08:00", food: "coffee", portion: "1 cup", symptomsAfter: 5 }] },
        ],
      },
      mindtrack: {
        mood: () => [
          { date: "2023-10-20", mood: 6, anxiety: 7, depression: 4, stress: 8, energy: 5 },
          { date: "2023-10-21", mood: 7, anxiety: 5, depression: 3, stress: 6, energy: 6 },
        ],
        journal: () => [{ date: "2023-10-20", journalEntry: "Feeling stressed about work, stomach hurts." }],
      },
      "sleep-stress-logger": {
        sleep: () => [
          {
            date: "2023-10-20",
            sleep: {
              bedtime: "23:00",
              wakeTime: "07:00",
              duration: 8,
              quality: 6,
              interruptions: 1,
              deepSleep: 2,
              remSleep: 1.5,
              lightSleep: 4.5,
            },
          },
        ],
        stress: () => [
          {
            date: "2023-10-20",
            stress: {
              level: 7,
              triggers: ["work", "deadline"],
              copingStrategies: ["deep_breathing"],
              effectiveness: 6,
            },
          },
        ],
      },
    }

    const generator = mockDataGenerators[appId as keyof typeof mockDataGenerators]?.[dataType as keyof any]
    return generator ? generator() : []
  }

  // Data storage and retrieval
  private async storeCrossAppData(data: CrossAppData[]): Promise<void> {
    if (typeof window === "undefined") return

    const existingData = this.getStoredCrossAppData()
    const newData = [...existingData, ...data]

    // Remove duplicates based on timestamp, sourceApp, and dataType
    const uniqueData = newData.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.timestamp === item.timestamp && t.sourceApp === item.sourceApp && t.dataType === item.dataType,
        ),
    )

    localStorage.setItem("crossAppData", JSON.stringify(uniqueData))
  }

  getStoredCrossAppData(): CrossAppData[] {
    if (typeof window === "undefined") return []

    const data = localStorage.getItem("crossAppData")
    return data ? JSON.parse(data) : []
  }

  // Unified data aggregation
  getUnifiedHealthData(dateRange?: { start: string; end: string }): UnifiedHealthData[] {
    const crossAppData = this.getStoredCrossAppData()
    const nutritionData = this.getNutritionData()
    const exerciseData = this.getExerciseData()

    // Group data by date
    const dataByDate: { [date: string]: UnifiedHealthData } = {}

    // Add cross-app data
    crossAppData.forEach((item) => {
      const date = item.timestamp.split("T")[0]
      if (!dataByDate[date]) {
        dataByDate[date] = { date }
      }

      // Map data to appropriate fields based on source app
      switch (item.sourceApp) {
        case "skintrack-plus":
          dataByDate[date].skin = item.data as SkinTrackData
          break
        case "gastroguard":
          dataByDate[date].gastro = item.data as GastroGuardData
          break
        case "healthhelper":
          dataByDate[date].general = item.data as HealthHelperData
          break
        case "mindtrack":
          dataByDate[date].mental = item.data as MindTrackData
          break
        case "sleep-stress-logger":
          dataByDate[date].sleepStress = item.data as SleepStressLoggerData
          break
      }
    })

    // Add nutrition and exercise data
    nutritionData.forEach((item) => {
      const date = item.date
      if (!dataByDate[date]) {
        dataByDate[date] = { date }
      }
      dataByDate[date].nutrition = item
    })

    exerciseData.forEach((item) => {
      const date = item.date
      if (!dataByDate[date]) {
        dataByDate[date] = { date }
      }
      dataByDate[date].exercise = item
    })

    // Convert to array and filter by date range if provided
    let result = Object.values(dataByDate).sort((a, b) => a.date.localeCompare(b.date))

    if (dateRange) {
      result = result.filter((item) => item.date >= dateRange.start && item.date <= dateRange.end)
    }

    return result
  }

  private getNutritionData(): any[] {
    if (typeof window === "undefined") return []

    const data = localStorage.getItem("nutritionEntries")
    return data ? JSON.parse(data) : []
  }

  private getExerciseData(): any[] {
    if (typeof window === "undefined") return []

    const data = localStorage.getItem("exerciseEntries")
    return data ? JSON.parse(data) : []
  }

  // Auto-sync configuration
  startAutoSync(intervalMinutes = 60): void {
    this.stopAutoSync()
    this.syncInterval = setInterval(
      () => {
        this.syncAllApps()
      },
      intervalMinutes * 60 * 1000,
    )
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Configuration management
  updateSyncConfig(config: DataSyncConfig): void {
    const existingIndex = this.syncConfigs.findIndex((c) => c.appId === config.appId)
    if (existingIndex >= 0) {
      this.syncConfigs[existingIndex] = config
    } else {
      this.syncConfigs.push(config)
    }
    this.saveSyncConfigs()
  }

  getSyncConfigs(): DataSyncConfig[] {
    return this.syncConfigs
  }

  // Persistence
  private saveConnectedApps(): void {
    if (typeof window === "undefined") return

    localStorage.setItem("connectedApps", JSON.stringify(this.connectedApps))
  }

  private loadConnectedApps(): void {
    if (typeof window === "undefined") return

    const data = localStorage.getItem("connectedApps")
    this.connectedApps = data ? JSON.parse(data) : []
  }

  private saveSyncConfigs(): void {
    if (typeof window === "undefined") return

    localStorage.setItem("syncConfigs", JSON.stringify(this.syncConfigs))
  }

  private loadSyncConfigs(): void {
    if (typeof window === "undefined") return

    const data = localStorage.getItem("syncConfigs")
    this.syncConfigs = data ? JSON.parse(data) : []
  }

  // Data export for other apps
  exportDataForApp(targetAppId: string, dataTypes: string[], dateRange?: { start: string; end: string }): any {
    const unifiedData = this.getUnifiedHealthData(dateRange)

    // Filter and format data based on target app requirements
    switch (targetAppId) {
      case "skintrack-plus":
        return this.exportForSkinTrack(unifiedData, dataTypes)
      case "gastroguard":
        return this.exportForGastroGuard(unifiedData, dataTypes)
      case "mindtrack":
        return this.exportForMindTrack(unifiedData, dataTypes)
      case "sleep-stress-logger":
        return this.exportForSleepStressLogger(unifiedData, dataTypes)
      default:
        return unifiedData
    }
  }

  private exportForSkinTrack(data: UnifiedHealthData[], dataTypes: string[]): any {
    return data
      .map((item) => ({
        date: item.date,
        nutrition: item.nutrition,
        stress: item.mental?.stress || item.sleepStress?.stress?.level,
        sleep: item.sleepStress?.sleep,
        exercise: item.exercise,
      }))
      .filter((item) => dataTypes.some((type) => item[type as keyof typeof item]))
  }

  private exportForGastroGuard(data: UnifiedHealthData[], dataTypes: string[]): any {
    return data
      .map((item) => ({
        date: item.date,
        nutrition: item.nutrition,
        stress: item.mental?.stress || item.sleepStress?.stress?.level,
        sleep: item.sleepStress?.sleep,
        mood: item.mental?.mood,
      }))
      .filter((item) => dataTypes.some((type) => item[type as keyof typeof item]))
  }

  private exportForMindTrack(data: UnifiedHealthData[], dataTypes: string[]): any {
    return data
      .map((item) => ({
        date: item.date,
        nutrition: item.nutrition,
        exercise: item.exercise,
        sleep: item.sleepStress?.sleep,
        skin: item.skin,
        gastro: item.gastro,
      }))
      .filter((item) => dataTypes.some((type) => item[type as keyof typeof item]))
  }

  private exportForSleepStressLogger(data: UnifiedHealthData[], dataTypes: string[]): any {
    return data
      .map((item) => ({
        date: item.date,
        nutrition: item.nutrition,
        exercise: item.exercise,
        mood: item.mental?.mood,
        stress: item.mental?.stress,
        skin: item.skin,
        gastro: item.gastro,
      }))
      .filter((item) => dataTypes.some((type) => item[type as keyof typeof item]))
  }
}
