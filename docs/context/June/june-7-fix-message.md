# Goal

- To fix the [message] page in sentinel-support

messages?userId=2851c6e3-9dd9-4e51-a975-bc71cb44c78e:1 Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.

- It fetches conversation from different users for e.g

user a -> messaged -> user b

user c - fetches that there's a conversation happened for user b but it does not fetch the messages but it duplicates on the ui
