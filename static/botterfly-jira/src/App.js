import React, { useEffect, useState } from "react";
import { events, invoke, view } from "@forge/bridge";
import Select from "@atlaskit/select";
import Button from "@atlaskit/button";
import { loremIpsum } from "lorem-ipsum";
function App() {
  const [issue, setIssue] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [paragraph, setParagraph] = useState("");
  const [context, setContext] = useState({});
  const handleFetchSuccess = (data) => {
    setIssue(data);
    if (Object.keys(data).length === 0) {
      throw new Error("No issue returned");
    }
  };

  const handleFetchError = (msg) => {
    console.error(msg);
  };

  const getContext = async () => {
    return await view.getContext();
  };
  const generateDescription = async () => {
    const payload = {
      issueId: context?.extension.issue.id,
      assignee: assignees,
      summary: issue?.fields?.summary,
      description:
        issue?.fields?.description?.content[0].content[0].text +
        " " +
        issue?.fields?.description?.content[0].content[1].text,
      subtasks: issue?.fields?.subtasks,
      projectCategory: issue?.fields?.project?.projectCategory?.name,
    };
    console.log("Payload:", payload);
    try {
      const response = await invoke("postIssue", {
        payload: JSON.stringify(payload),
      });

      const text = loremIpsum({
        count: 1,
        format: "plain",
        paragraphLowerBound: 3,
        paragraphUpperBound: 7,
        random: Math.random,
        sentenceLowerBound: 5,
        sentenceUpperBound: 15,
        suffix: "\n",
        units: "paragraph",
      });

      setParagraph(text);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const createSubtask = async () => {
    const payload = [
      {
        summary: "Subtask 1",
        description: "Subtask Description 1",
      },
      {
        summary: "Subtask 2",
        description: "Subtask Description 2",
      },
    ];
    try {
      const response = await invoke("createSubtask", payload);
      console.log("Response:", response);
      if (response) {
        view.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        console.error("Response:", error.response);
      }
    }
  };

  useEffect(async () => {
    const context = await getContext();
    setContext(context);
    const fetchIssue = async () => invoke("fetchIssue");
    fetchIssue()
      .then((data) => {
        console.log("Data:", data);
        handleFetchSuccess(data);
      })
      .catch(handleFetchError("Failed to fetch issue"));
    const fetchAssignees = async () => invoke("fetchAssignees");
    fetchAssignees()
      .then((data) => {
        setAssignees(data.assignees);
      })
      .catch(handleFetchError("Failed to fetch assignees"));
  }, []);

  if (!issue) {
    return <div>Loading...</div>;
  }
  return (
    <>
    {context?.extension?.issue?.key}
      <span>Issue Summary: {issue?.fields?.summary}</span>
      {/* <span>Issue description: {issue?.fields?.description?.content[0].content[0].text+' '+issue?.fields?.description?.content[0].content[1].text}</span> */}
      <div>
        <Select
          className="single-select"
          classNamePrefix="react-select"
          onChange={(selected) => console.log("Selected:", selected)}
          options={assignees.map((assignee) => ({
            label: assignee,
            value: assignee,
          }))}
          placeholder="Select assignee"
        />
        <br />
        <p>{paragraph}</p>
        <br />
        <Button
          appearance="primary"
          onClick={() =>
            createSubtask()
          }
        >
          Add Subtasks
        </Button>
      </div>
      <div></div>
    </>
  );
}

export default App;
