# The AI assistant

Every page has a chat bubble: the business's **customer assistant** from SSS. It
answers from the business's own data (catalogue, prices, stock, services, hours,
FAQ, the context the owner wrote) and can take orders and leads, following the
abilities chosen in SSS. Its answers use the business's SSS assistant credits.

## Turn it on

1. In SSS, open **Customer bot** and turn it on.
2. Enable **Website widget**. SSS then publishes the bot with the showcase, and
   this site picks it up by itself. There's nothing to configure here.
3. Optionally set its name, avatar, greeting, suggested questions and accent color in
   the same SSS page. The widget uses all of them.

To use a different bot key than the published one, set `SSS_BOT_KEY=cb_…`. To hide the
assistant on this site only, set the business metadata key `assistant: false`
([metadata.md](metadata.md)).

## What the widget does

[`src/components/assistant.tsx`](../src/components/assistant.tsx)

| Feature | How |
| --- | --- |
| Remembers the conversation | A random visitor id in `localStorage` (`sss_visitor_id`); history is loaded from `GET …/messages?source=widget&visitorId=` |
| New chat | `DELETE …/messages` |
| Greeting and suggestions | From SSS; suggestions show before the first message |
| Quick-reply buttons | When the bot asks a choice question (`choices` in the reply), options show as buttons; multiple choice gets a Send button |
| Pictures and files | `files` in a reply (product photos, documents) show inside the bubble |
| Formatting | Replies are markdown, rendered with HTML escaped |
| Errors | Rate limit (12 messages / minute / visitor) and outages show a short message; the text stays in the box |
| Accessibility | Dialog role, live region, Esc closes, Enter sends, Shift+Enter adds a new line |

## Open it from your own buttons

- **A link:** `<a href="#assistant">Ask us</a>` opens it. The SSS CTA banner link `#assistant` works too.
- **With a question typed in:**

  ```tsx
  import { AskButton } from "@/components/ask-button";
  <AskButton question={`Is "${product.name}" available in red?`}>Ask about this product</AskButton>
  ```

  or from any script:

  ```js
  window.dispatchEvent(new CustomEvent("sss:ask", { detail: "Do you deliver to Kribi?" }));
  ```

Product pages already have **Ask about this product**.

## Demo mode

On demo data (no `SSS_STORE_SLUG`) the widget uses the key `demo` and answers with a few
canned replies, without calling SSS.

## The API, if you build your own client

```http
POST {SSS_API_URL}/api/v1/bot/{publicKey}/messages
Content-Type: application/json

{ "message": "Do you have shea butter?", "visitorId": "v_abc123…", "source": "widget" }
```

```json
{ "data": { "sessionId": "…", "reply": "Yes! Shea butter 250 g is 3,500 FCFA…", "files": [], "choices": null } }
```

- `visitorId`: 6–80 characters, stable per visitor.
- `files` (optional): up to 4 `{ name, mediaType, url | dataBase64 }`.
- `GET /api/v1/bot/{publicKey}` returns the public profile (name, avatar, greeting, suggestions, accent).
