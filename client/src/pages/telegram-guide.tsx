import Navigation from "@/components/navigation";
import TelegramIntegration from "@/components/telegram-integration";

export default function TelegramGuide() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <TelegramIntegration />
    </div>
  );
}
