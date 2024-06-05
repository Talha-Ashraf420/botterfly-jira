import React, { useEffect, useState } from 'react';
import { events, invoke, view } from '@forge/bridge';
import Select from '@atlaskit/select';
import Button from '@atlaskit/button';
import { loremIpsum } from 'lorem-ipsum';
function App() {
  const [issue, setIssue] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [paragraph, setParagraph] = useState('');
  let context;
  const handleFetchSuccess = (data) => {
    setIssue(data)
    if (Object.keys(data).length === 0){
      throw new Error('No issue returned');
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
      description: issue?.fields?.description?.content[0].content[0].text + ' ' + issue?.fields?.description?.content[0].content[1].text,
      subtasks: issue?.fields?.subtasks,
      projectCategory: issue?.fields?.project?.projectCategory?.name,
    }
    console.log('Payload:', payload);
    try {
      const response = await invoke('postIssue', {
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
        units: "paragraph"
      });
  
      setParagraph(text);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(async() => {
  getContext().then((data) => {
    context = data;
  });
    const fetchIssue = async () => invoke('fetchIssue');
    fetchIssue().then((data) => {
      handleFetchSuccess(data);
    }).catch(handleFetchError('Failed to fetch issue'));

    const fetchAssignees = async () => invoke('fetchAssignees');
    fetchAssignees().then((data) => {
      setAssignees(data.assignees);
    }).catch(handleFetchError('Failed to fetch assignees'));
  }, []);

  if (!issue) {
    return <div>Loading...</div>;
  }
  return (
   <>
    <span>Issue Summary: {issue?.fields?.summary}</span>
    <span>Issue description: {issue?.fields?.description?.content[0].content[0].text+' '+issue?.fields?.description?.content[0].content[1].text}</span>
    <div>
      <Select
       className="single-select"
       classNamePrefix="react-select"
       onChange={(selected) => console.log('Selected:', selected)}
        options={assignees.map((assignee) => ({ label: assignee, value: assignee }))}
        placeholder="Select assignee"
      />
      <br/>
      <p>{paragraph}</p>
      <br/>
      <Button appearance="primary" onClick={generateDescription}>Generate Description</Button>
    </div>
    <div>
    </div>
  </>
  );
}

export default App;
