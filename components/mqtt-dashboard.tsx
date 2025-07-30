"use client"

import { useEffect, useState, useRef } from "react"
import {
  connectMqttClient,
  parseMqttMessage,
  type SiteNetworkData,
  USER_REQUESTED_TOPICS,
  SITE_DISPLAY_NAMES,
  MQTT_BROKER_URL,
  NOT_READY_SITES, // Import the new constant
} from "@/lib/mqtt-client"
import { SiteNetworkCard } from "./site-network-card"
import { UnderDevelopmentCard } from "./under-development-card" // Import the new component
import type { MqttClient as MqttClientType } from "mqtt"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export function MqttDashboard() {
  const [siteData, setSiteData] = useState<Record<string, SiteNetworkData>>(() => {
    const initialData: Record<string, SiteNetworkData> = {}
    USER_REQUESTED_TOPICS.forEach((topic) => {
      initialData[topic] = {
        topic,
        displayName: SITE_DISPLAY_NAMES[topic] || topic.replace("/NETWORK", ""),
        data: null,
        status: "no_data",
      }
    })
    return initialData
  })

  const [mqttConnectionStatus, setMqttConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting")
  const mqttClientRef = useRef<MqttClientType | null>(null)

  useEffect(() => {
    const client = connectMqttClient(
      USER_REQUESTED_TOPICS,
      (topic, message) => {
        const parsedData = parseMqttMessage(message)
        setSiteData((prevData) => ({
          ...prevData,
          [topic]: {
            ...prevData[topic],
            data: parsedData,
            status: "connected",
          },
        }))
      },
      () => {
        setMqttConnectionStatus("connected")
      },
      (error) => {
        setMqttConnectionStatus("error")
        console.error("MQTT connection error:", error)
      },
      () => {
        setMqttConnectionStatus("disconnected")
      },
    )

    mqttClientRef.current = client

    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.end()
      }
    }
  }, [])

  const sortedTopics = Object.keys(siteData).sort((a, b) => {
    const nameA = siteData[a].displayName.toLowerCase()
    const nameB = siteData[b].displayName.toLowerCase()
    if (nameA < nameB) return -1
    if (nameA > nameB) return 1
    return 0
  })

  return (
    <div className="flex flex-col w-full min-h-screen p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">MQTT Network Dashboard</h1>

      {mqttConnectionStatus === "error" && (
        <Alert variant="destructive" className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Failed to connect to the MQTT broker at {MQTT_BROKER_URL}. Please check the broker status or your network
            connection.
          </AlertDescription>
        </Alert>
      )}
      {mqttConnectionStatus === "disconnected" && (
        <Alert className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Disconnected</AlertTitle>
          <AlertDescription>Disconnected from the MQTT broker. Attempting to reconnect...</AlertDescription>
        </Alert>
      )}
      {mqttConnectionStatus === "connecting" && (
        <Alert className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Connecting</AlertTitle>
          <AlertDescription>Attempting to connect to the MQTT broker at {MQTT_BROKER_URL}...</AlertDescription>
        </Alert>
      )}
      {mqttConnectionStatus === "connected" && (
        <Alert className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Connected</AlertTitle>
          <AlertDescription>Successfully connected to the MQTT broker. Waiting for data updates.</AlertDescription>
        </Alert>
      )}

      <h2 className="text-2xl font-semibold mb-4 mt-8">Active Sites</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedTopics.map((topic) => (
          <SiteNetworkCard key={topic} site={siteData[topic]} />
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-4 mt-8">Under Development Sites</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {NOT_READY_SITES.map((siteName) => (
          <UnderDevelopmentCard key={siteName} siteName={siteName} />
        ))}
      </div>
    </div>
  )
}
