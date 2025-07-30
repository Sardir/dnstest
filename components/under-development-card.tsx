import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Wrench } from "lucide-react"

interface UnderDevelopmentCardProps {
  siteName: string
}

export function UnderDevelopmentCard({ siteName }: UnderDevelopmentCardProps) {
  return (
    <Card className="h-full flex flex-col border-dashed border-gray-300 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Wrench className="h-4 w-4" />
          {siteName}
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-500">
          This site is currently under development.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center text-sm text-gray-400 dark:text-gray-600">
        Data will be available soon.
      </CardContent>
    </Card>
  )
}
