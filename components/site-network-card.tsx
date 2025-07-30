import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { SiteNetworkData } from "@/lib/mqtt-client"
import { CircleDot, CheckCircle, XCircle } from "lucide-react"

interface SiteNetworkCardProps {
  site: SiteNetworkData
}

export function SiteNetworkCard({ site }: SiteNetworkCardProps) {
  const { displayName, data, status } = site

  const getStatusColor = (status: SiteNetworkData["status"]) => {
    switch (status) {
      case "connected":
        return "text-green-500"
      case "loading":
        return "text-yellow-500"
      case "no_data":
        return "text-gray-500"
      case "error":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusText = (status: SiteNetworkData["status"]) => {
    switch (status) {
      case "connected":
        return "Online"
      case "loading":
        return "Connecting..."
      case "no_data":
        return "No Data Yet"
      case "error":
        return "Error"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <CircleDot className={`h-4 w-4 ${getStatusColor(status)}`} />
          {displayName}
        </CardTitle>
        <CardDescription>{data?.timestamp ? `Last updated: ${data.timestamp}` : getStatusText(status)}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm flex-grow">
        {data ? (
          <>
            <div>
              <span className="font-medium">Current DNS:</span> {data.currentDnsServer || "N/A"}
            </div>
            <div>
              <span className="font-medium">Ping:</span> {data.ping || "N/A"}
            </div>
            <div>
              <span className="font-medium">Download:</span> {data.download || "N/A"}
            </div>
            <div>
              <span className="font-medium">Upload:</span> {data.upload || "N/A"}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">DNS Resolution:</span>{" "}
              {data.dnsResolutionStatus === "PASS" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : data.dnsResolutionStatus === "FAIL" ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                "N/A"
              )}
              {data.dnsResolutionStatus === "PASS" ? "PASS" : data.dnsResolutionStatus === "FAIL" ? "FAIL" : ""}
            </div>
            <div>
              <span className="font-medium">Primary DNS:</span> {data.primaryDns || "N/A"}
            </div>
            <div>
              <span className="font-medium">Secondary DNS:</span> {data.secondaryDns || "N/A"}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Pools Test:</span>{" "}
              {data.poolsResolutionTest === "PASS" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : data.poolsResolutionTest === "FAIL" ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                "N/A"
              )}
              {data.poolsResolutionTest === "PASS" ? "PASS" : data.poolsResolutionTest === "FAIL" ? "FAIL" : ""}
            </div>
          </>
        ) : (
          <div className="text-muted-foreground">Waiting for data...</div>
        )}
      </CardContent>
    </Card>
  )
}
