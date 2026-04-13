"use client";

import { MessageSquare } from "lucide-react";
import { 
    MessagingLayout, 
    ChatListHeader, 
    MessagingEmptyState 
} from "@/features/messaging";

export default function StudentMessagePage() {
    return (
        <MessagingLayout
            sidebar={
                <>
                    <ChatListHeader 
                        title="Private Chats" 
                        onNewChat={() => console.log("New Chat")}
                    />
                    <MessagingEmptyState 
                        icon={<MessageSquare className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />}
                        title="No chats yet!"
                        description="Create your first chat conversation to start chatting."
                        actionLabel="Start Chatting"
                        onAction={() => console.log("Start Chatting")}
                    />
                </>
            }
        >
            <MessagingEmptyState 
                icon={<MessageSquare className="w-10 h-10 text-blue-600 dark:text-blue-400" />}
                title="Your Inbox"
                description="Select a conversation from the left to start chatting, or create a new one."
                actionLabel="Create First Chat"
                onAction={() => console.log("Create First Chat")}
            />
        </MessagingLayout>
    );
}
