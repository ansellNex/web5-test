export const protocolDefinition = {
    "protocol": "https://social-media.xyz",
    "published": true,
    "types": {
      "post": {
        "schema": "https://social-media.xyz/schemas/postSchema",
        "dataFormats": ["text/plain"]
      },
      "reply": {
        "schema": "https://social-media.xyz/schemas/replySchema",
        "dataFormats": ["text/plain"]
      },
    },
    "structure": {
      "post": {
        "$actions": [
          {
            "who": "anyone",
            "can": "read"
          },
          {
            "who": "anyone",
            "can": "write"
          }
        ],
        "reply": {
          "$actions": [
            {
              "who": "recipient",
              "of": "post",
              "can": "write"
            },
            {
              "who": "author",
              "of": "post",
              "can": "write"
            }
          ]
        }
      },
    }
}