import { Datastore } from '@google-cloud/datastore';

const datastore = new Datastore({
  projectId: 'circles-chat-22',
});

export default datastore;
