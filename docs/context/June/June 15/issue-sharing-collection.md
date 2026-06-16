# Issue

- It returns an error code [404] when the user tries to shared their collection. 

- curl 'http://localhost:3001/question-bank/collections/52e8b1d9-e738-4f6e-a191-7db7448476e6/shares' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Origin: http://localhost:3002' \
  -H 'Pragma: no-cache' \
  -H 'Referer: http://localhost:3002/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36' \
  -H 'authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6Ijk0ZGJmZWRkLThmNjgtNDVhNC05NmU5LWU2YzUxNDdjZjZkMSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2toY254ZG1peXl6Z2JhZmpwcmZmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5ODM2OWU0Ny0xZTE2LTQ2MDAtOWIyNy1kZWFhZTdlNDNkMGMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgxNjE2Mjg4LCJpYXQiOjE3ODE2MTI2ODgsImVtYWlsIjoibGl2YWRvbWNAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCIsImdvb2dsZSJdLCJyb2xlIjoic3VwZXJhZG1pbiJ9LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKTmYxRXVkWVl0VFI1WHVfZk9JOUhyN0FyYjUzSDJYWjZhUm82XzVJUEtaS0FIaUJ1WT1zOTYtYyIsImVtYWlsIjoibGl2YWRvbWNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcnN0X25hbWUiOiJNYXJrIEpvc2VwaCIsImZ1bGxfbmFtZSI6Ik1hcmsgSm9zZXBoIExpdmFkbyIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsImxhc3RfbmFtZSI6IkxpdmFkbyIsIm5hbWUiOiJNYXJrIEpvc2VwaCBMaXZhZG8iLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKTmYxRXVkWVl0VFI1WHVfZk9JOUhyN0FyYjUzSDJYWjZhUm82XzVJUEtaS0FIaUJ1WT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTAxMjQwMzIyODk1NjEyODcxNjQ5Iiwicm9sZSI6InN1cGVyYWRtaW4iLCJzdWIiOiIxMDEyNDAzMjI4OTU2MTI4NzE2NDkifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc4MTYxMjY4OH1dLCJzZXNzaW9uX2lkIjoiNzdjYjZkYTItODQ1MC00YWM5LWE5N2EtYmYwM2Y1ZWUxZjVkIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.VN6T9ufbXt6GIeJ_wNY8SeBwBglkob1XU-7JhfuMtHKBTVUPvSNBYPIAm5zRv2JqNxIxkbgfzedMQmqBTwtVkg' \
  -H 'content-type: application/json' \
  -H 'sec-ch-ua: "Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  --data-raw '{"userIds":["2851c6e3-9dd9-4e51-a975-bc71cb44c78e"]}'

# Implement

## Problem
Questions that belong to a [collection] are currently still visible in the [question bank] of users who have no access to that collection.

## Expected Behavior
A [question] included in a [collection] should be hidden from a [user]'s [question bank] 
if ALL of the following are true:

1. The user is not assigned to the collection
2. The user is not the owner of the question or the collection
3. The collection is not marked as [public]