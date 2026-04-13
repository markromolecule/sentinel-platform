"use client";

import { MessageSquare } from "lucide-react";
import { 
    MessagingLayout, 
    ChatListHeader, 
    MessagingEmptyState 
} from "@/features/messaging";

export default function ProctorMessagesPage() {
    return (
        <MessagingLayout
            sidebar={
                <>
                    <ChatListHeader 
                        title="Messages" 
                        onNewChat={() => console.log("New Chat")}
                    />
                    <MessagingEmptyState 
                        icon={<MessageSquare className="w-8 h-8 text-purple-600" />}
                        title="No chats yet!"
                        description="Start a conversation with your students."
                        actionLabel="Start Chatting"
                        onAction={() => console.log("Start Chatting")}
                    />
                </>
            }
        >
            <MessagingEmptyState 
                title="Your Inbox"
                description="Select a conversation from the left to start chatting, or create a new one."
                actionLabel="Create First Chat"
                onAction={() => console.log("Create First Chat")}
            />
        </MessagingLayout>
    );
}
