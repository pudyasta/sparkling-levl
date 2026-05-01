import pipe from 'sparkling-method';

export const pickAnyFile = (type: 'pdf' | 'image' | 'all', callback?: (res: any) => void) => {
  // Map the friendly 'type' argument to the MIME types the Native side expects
  const mimeTypes = type === 'pdf' ? ['application/pdf'] : type === 'image' ? ['image/*'] : ['*/*'];

  pipe.call(
    'Filepicker.pickFile',
    {
      type: ['*/*'],
    },
    (res) => {
      callback?.(res);
      console.log('File URI:', JSON.stringify(res, null, 2));
    }
  );
};
