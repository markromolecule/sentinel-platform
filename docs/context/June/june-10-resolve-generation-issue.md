# Goal

- Resolve issue on generating a questions

# Issue

api-client.ts:52  POST http://localhost:3001/ai/generate-preview 403 (Forbidden)
(anonymous) @ api-client.ts:52
await in (anonymous)
(anonymous) @ use-generate-questions-mutation.ts:42
(anonymous) @ mutation.ts:190
(anonymous) @ retryer.ts:156
(anonymous) @ retryer.ts:222
execute @ mutation.ts:235
await in execute
mutate @ mutationObserver.ts:142
(anonymous) @ useMutation.ts:56
(anonymous) @ use-import-handler.ts:100
executeDispatch @ react-dom-client.development.js:20543
runWithFiberInDEV @ react-dom-client.development.js:986
processDispatchQueue @ react-dom-client.development.js:20593
(anonymous) @ react-dom-client.development.js:21164
batchedUpdates$1 @ react-dom-client.development.js:3377
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20747
dispatchEvent @ react-dom-client.development.js:25693
dispatchDiscreteEvent @ react-dom-client.development.js:25661
installHook.js:1 AI Generation Error: ApiError: Error
    at api-client.ts:81:19
    at async useGenerateQuestionsMutation.useMutation [as mutationFn] (use-generate-questions-mutation.ts:42:30)
overrideMethod @ installHook.js:1
error @ intercept-console-error.ts:42
(anonymous) @ use-import-handler.ts:53
execute @ mutation.ts:288

- ensure that it now follows the 