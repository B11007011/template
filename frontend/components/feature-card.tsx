import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  color: string
}

export default function FeatureCard({ icon: Icon, title, color }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <h3 className="text-xs font-medium">{title}</h3>
    </div>
  )
}
