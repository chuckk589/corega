import mitt from 'mitt';

type Events = {
  alert: {
    header: string;
    color: string;
    text: string;
  };
  openDialog: {
    header: string;
    message: string;
    eventName: string;
    id: number;
  };
  openModal: {
    url: string;
    method: 'POST' | 'GET' | 'PUT' | 'DELETE';
    header: string;
    footer: string;
    eventName: string;
    noSave: boolean;
    fields: {
      type: string;
      label: string;
      disabled: boolean;
      key: string;
      value: string;
      dependsOn: {
        key: string;
        value: string;
      };
      options: {
        label: string;
        value: string;
      }[];
    }[];
  };
};

const emitter = mitt<Events>(); // inferred as Emitter<Events>
export default emitter;
