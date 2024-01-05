import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { protocolDefinition } from "./protocols";
const recipientDid =
  "did:ion:EiBEK7fQLAhp-vzPz_NwSq4IBCazGATac6rnd58pjkXlnw:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24tc2lnIiwicHVibGljS2V5SndrIjp7ImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ4IjoiTF91V3lMSmpJYnZTNFRYUGNiYnEyMUlENUJhOXpPbFQ4T1RvMnJfSDNVZyJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiJdLCJ0eXBlIjoiSnNvbldlYktleTIwMjAifSx7ImlkIjoiZHduLWVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiI5eEhBWHk3QjZzQ2MyZTREZ1RSSEQ2X1d5bGFyQWNobldwQVFSdDJYZkgwIiwieSI6IlZlN2wzSlJ1MFJKV1U3LWlPX3lRY0lQOEJnX1RKQ1k5cEtqWTVmYnF5M0kifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7ImVuY3J5cHRpb25LZXlzIjpbIiNkd24tZW5jIl0sIm5vZGVzIjpbImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduNSIsImh0dHBzOi8vZHduLnRiZGRldi5vcmcvZHduMyJdLCJzaWduaW5nS2V5cyI6WyIjZHduLXNpZyJdfSwidHlwZSI6IkRlY2VudHJhbGl6ZWRXZWJOb2RlIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlDQ09TUEFCeGlXeDhMdEJXU3d6QnZ6MzVzRXFLTkFyUTdHYmtOeHdwTGJwUSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQ054MWdYTWFoOHp4NVdhaWpHc3JzVkFTQVNqeDc4SHExOVlEbmxwazk2V1EiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUNfdjVyTDZxY25MOWJjaVh5eldfOXE1VkRRajlZSFVnV3dvdlkwRmhTNU5RIn19";

function App() {
  const [web5, setWeb5] = useState(null);
  const [did, setDid] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async () => {
      const { Web5 } = await import("@web5/api/browser");
      try {
        const { web5, did } = await Web5.connect();

        setWeb5(web5);
        setDid(did);

        if (web5 && did) {
          console.log("Web5 initialized");
          const { protocol, status } = await web5.dwn.protocols.configure({
            message: {
              definition: protocolDefinition,
            },
          });
          console.log("PROTOCOL LOCAL STATUS", status);

          //sends protocol to remote DWNs immediately (vs waiting for sync)
          const { status: remoteStatus } = await protocol.send(did);
          console.log("PROTOCOL REMOTE STATUS", status);
        }
      } catch (error) {
        console.error("Error initializing Web5:", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      // FETCHING POSTS SENT TO YOU
      if (web5 && did) {
        const { records: postRecords } = await web5.dwn.records.query({
          from: did,
          message: {
            filter: {
              recipient: did,
              schema: "https://social-media.xyz/schemas/postSchema",
              dataFormat: "text/plain",
              protocol: protocolDefinition.protocol,
              protocolPath: "post",
            },
          },
        });

        if (postRecords.length) {
          console.log({
            myPostRecords: postRecords,
            data: await postRecords[0].data.text(),
          });
          // await postRecords[0].update();
        }
      }
    })();
  }, [web5, did]);

  useEffect(() => {
    // UPDATING EDGE
    (async () => {
      if (web5 && did) {
        const { records: postRecords, status: fetchStatus } =
          await web5.dwn.records.query({
            from: recipientDid,
            message: {
              filter: {
                recipient: recipientDid,
                schema: "https://social-media.xyz/schemas/postSchema",
                dataFormat: "text/plain",
                protocol: protocolDefinition.protocol,
                protocolPath: "post",
              },
            },
          });

        console.log({ postRecords, fetchStatus });

        if (postRecords.length) {
          console.log(postRecords);
          console.log({ postRecords, data: await postRecords[0].data.text() });
          const { status: updateStatus } = await postRecords[0].update({
            data: "Updated223332",
          });

          const { status: sendStatus } = await postRecords[0].send(
            recipientDid
          );
          console.log({ updateStatus, sendStatus: true });
        }
      }
    })();
  }, [web5, did]);

  const action = async () => {
    const { record: postRecord, status: createStatus } =
      await web5.dwn.records.create({
        data: "Hey this is my first post!",
        message: {
          recipient: recipientDid,
          schema: "https://social-media.xyz/schemas/postSchema",
          dataFormat: "text/plain",
          protocol: protocolDefinition.protocol,
          protocolPath: "post",
        },
      });

    if (postRecord) {
      console.log("created post");
      const { status: postSend } = await postRecord.send(recipientDid);
      console.log({ postSend });
      const { record: replyRecord, status: createStatus } =
        await web5.dwn.records.create({
          data: "Hey this is my first reply!",
          message: {
            parentId: postRecord.id,
            contextId: postRecord.contextId,
            recipient: recipientDid,
            schema: "https://social-media.xyz/schemas/replySchema",
            dataFormat: "text/plain",
            protocol: protocolDefinition.protocol,
            protocolPath: "post/reply",
          },
        });

      if (replyRecord) {
        const { status } = await replyRecord.send(recipientDid);
        console.log("created reply", status);
      }
    }
  };

  return (
    <>
      <div>
        <button
          onClick={async () => {
            try {
              // Write the text to the clipboard
              await navigator.clipboard.writeText(did);
              console.log("Text successfully copied to clipboard");
            } catch (err) {
              console.error("Failed to copy text to clipboard", err);
            }
          }}
        >
          Copy DID
        </button>
        <button onClick={action}>Action</button>
      </div>
    </>
  );
}

export default App;
