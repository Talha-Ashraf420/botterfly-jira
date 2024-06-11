const createPayload = (parentKey,subtaskSummary,subtaskDescription) => {
   return  {
        fields: {
          project: {
            key: parentKey.split('-')[0], // The project key is the part before the '-' in the issue key
          },
          parent: {
            key: parentKey,
          },
          summary: subtaskSummary,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: subtaskDescription
                  }
                ]
              }
            ]
          },
          issuetype: {
            id: '10003', // The id for the subtask issue type,
            name: 'Subtask',
          },
        },
      };
}

export { createPayload };