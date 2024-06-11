import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import * as utils from './utils/utils';
const resolver = new Resolver();

resolver.define('fetchIssue', async (req) => {
  const key = req.context.extension.issue.key;
  const res = await api.asUser().requestJira(route`/rest/api/3/issue/${key}`);
  const data = await res.json();
  return data;
});

resolver.define('fetchAssignees', async () => {
  const response = await api.fetch('https://botterfly-app-server-7b2dd6108c08.herokuapp.com/okrs/assignees/6639d2e99559f9359fb4c323');
  const data = await response.json();
  console.log('Assignees====>>>:', data);
  return data;
});

resolver.define('postIssue', async (request) => {
  let body = request.payload;
  const response = await api.fetch('https://webhook.site/b3e1aec6-97de-4155-93ac-bb25ac8b1444', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response;
});

resolver.define('createSubtask', async (req) => {
  const parentKey = req.context.extension.issue.key;
  const body = req.payload // Parse the body
  const toAdd = [];
  for(let i=0; i<body.length; i++){
    const subtaskSummary = body[i].summary;
    const subtaskDescription = body[i].description;
    toAdd.push(utils.createPayload(parentKey, subtaskSummary, subtaskDescription));
  }
  const res = await api.asUser().requestJira(route`/rest/api/3/issue/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      issueUpdates: toAdd,
    }),
  });

  console.log('Response:', res);
  const data = await res.json();
  return data;
});

export const handler = resolver.getDefinitions();
// "Operation value must be an Atlassian Document (see the Atlassian Document Format)"