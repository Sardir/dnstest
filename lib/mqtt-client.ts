import mqtt from "mqtt"

export const MQTT_BROKER_URL = "mqtt://64.227.163.97:8083"

// Define the topics explicitly requested by the user
export const USER_REQUESTED_TOPICS = [
  "Arad2/NETWORK",
  "Harz1/NETWORK",
  "Mafraq/NETWORK",
  "Harz3/NETWORK",
  "Arad1/NETWORK",
  "Naheel1/NETWORK",
  "Kasna/NETWORK",
  "Faqa/NETWORK",
  "Wagan1/NETWORK",
  "Hayeer/NETWORK",
  "Harz2/NETWORK",
  "BK1/NETWORK",
  "BK2/NETWORK",
  "Wagan3/NETWORK",
  "Wagan4/NETWORK",
  "Omar1/NETWORK",
  "Omar2/NETWORK",
  "Forest2/NETWORK",
  "Forest1/NETWORK",
]

// User provided siteMappings
const RAW_SITE_MAPPINGS: { [topic: string]: string } = {
  "Omar1/NETWORK": "F14: Omar 1",
  "Omar2/NETWORK": "F15: Omar 2",
  "Harz1/NETWORK": "F10: Harz 1",
  "Harz2/NETWORK": "F11: Harz 2",
  "Harz3/NETWORK": "F16: Harz 3",
  "Faqa/NETWORK": "F21: Al Faqaa",
  "Naheel/NETWORK": "F26: NAHEEL",
  "BK1/NETWORK": "F8: BK 1",
  "BK2/NETWORK": "F17: BK 2",
  "Arad1/NETWORK": "F27: Al Arad",
  "Wagan/NETWORK": "F19: Wagan",
  "Wagan3/NETWORK": "F32: WAGAN 3",
  "Wagan4/NETWORK": "F33: WAGAN 4",
  "Arad2/NETWORK": "F34: AL ARAD 2",
  "Hayeer/NETWORK": "F12: Al Hayeer",
  "Forest1/NETWORK": "F22: Forest 1",
  "Mafraq/NETWORK": "F20: Mafraq",
  "Kasna/NETWORK": "F26: Khaznah",
  "Forest2/NETWORK": "F23: Forest 2", // Added mapping for Forest2
}

// Sites that do not have a corresponding MQTT topic yet
export const NOT_READY_SITES: string[] = [
  "F31: NAHEEL 2",
  "F18: BK 3",
  "F30: BK 4",
  "F9: Liwa 2ZAKIR",
  "F35: PALACE",
  "F36: Hili 1",
  "F37: Hili 2",
  "F38: Al Shamkhah",
  "F39: Al Taweela",
]

// Create the final SITE_DISPLAY_NAMES by mapping user-requested topics
// and handling the slight discrepancies (Naheel1 vs Naheel, Wagan1 vs Wagan)
export const SITE_DISPLAY_NAMES: { [topic: string]: string } = {}
USER_REQUESTED_TOPICS.forEach((topic) => {
  if (RAW_SITE_MAPPINGS[topic]) {
    SITE_DISPLAY_NAMES[topic] = RAW_SITE_MAPPINGS[topic]
  } else if (topic === "Naheel1/NETWORK" && RAW_SITE_MAPPINGS["Naheel/NETWORK"]) {
    SITE_DISPLAY_NAMES[topic] = RAW_SITE_MAPPINGS["Naheel/NETWORK"]
  } else if (topic === "Wagan1/NETWORK" && RAW_SITE_MAPPINGS["Wagan/NETWORK"]) {
    SITE_DISPLAY_NAMES[topic] = RAW_SITE_MAPPINGS["Wagan/NETWORK"]
  } else {
    // Fallback if no specific mapping is found
    SITE_DISPLAY_NAMES[topic] = topic.replace("/NETWORK", "")
  }
})

export type NetworkData = {
  currentDnsServer?: string // Can be concatenated IPs
  ping?: string
  download?: string
  upload?: string // New field
  primaryDns?: string
  secondaryDns?: string
  poolsResolutionTest?: "PASS" | "FAIL" | "N/A" // New field
  dnsResolutionStatus?: "PASS" | "FAIL" // New field to explicitly track DNS resolution status
  timestamp: string
}

export type SiteNetworkData = {
  topic: string
  displayName: string
  data: NetworkData | null
  status: "loading" | "connected" | "no_data" | "error"
}

export const parseMqttMessage = (message: string): NetworkData => {
  const dnsResolutionFailed = message.includes("DNS Resolution: FAILED:")

  let currentDnsServer: string | undefined
  // Regex to capture one or more IP addresses after "Current DNS Servers in use:"
  // It tries to capture sequences of digits and dots.
  const currentDnsMatch = message.match(/Current DNS Servers in use:([\d.]+(?:[\d.]+)*)/)
  if (currentDnsMatch && currentDnsMatch[1]) {
    currentDnsServer = currentDnsMatch[1]
  } else if (dnsResolutionFailed) {
    currentDnsServer = "N/A (DNS Failed)"
  }

  const pingMatch = message.match(/Ping: ([\d.]+ ms)/)
  const downloadMatch = message.match(/Download: ([\d.]+ Mbit\/s)/)
  const uploadMatch = message.match(/Upload: ([\d.]+ Mbit\/s)/) // New regex

  const primaryDnsMatch = message.match(/Primary: ([\d.]+)/)
  const secondaryDnsMatch = message.match(/Secondary: ([\d.]+)/)

  const poolsResolutionTestMatch = message.match(/Pools Resolution Test: (PASS|FAIL)/) // New regex

  return {
    currentDnsServer: currentDnsServer,
    ping: pingMatch ? pingMatch[1] : undefined,
    download: downloadMatch ? downloadMatch[1] : undefined,
    upload: uploadMatch ? uploadMatch[1] : undefined,
    primaryDns: primaryDnsMatch ? primaryDnsMatch[1] : undefined,
    secondaryDns: secondaryDnsMatch ? secondaryDnsMatch[1] : undefined,
    poolsResolutionTest: poolsResolutionTestMatch ? (poolsResolutionTestMatch[1] as "PASS" | "FAIL") : "N/A",
    dnsResolutionStatus: dnsResolutionFailed ? "FAIL" : "PASS",
    timestamp: new Date().toLocaleString(),
  }
}

export const connectMqttClient = (
  topics: string[],
  onMessage: (topic: string, message: string) => void,
  onConnect: () => void,
  onError: (error: Error) => void,
  onClose: () => void,
) => {
  const client = mqtt.connect(MQTT_BROKER_URL)

  client.on("connect", () => {
    console.log("Connected to MQTT broker")
    onConnect()
    topics.forEach((topic) => {
      client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err)
        }
      })
    })
  })

  client.on("message", (topic, message) => {
    onMessage(topic, message.toString())
  })

  client.on("error", (err) => {
    console.error("MQTT Error:", err)
    onError(err)
    client.end()
  })

  client.on("close", () => {
    console.log("MQTT client disconnected")
    onClose()
  })

  return client
}
