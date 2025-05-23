import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const SearchBox = () => {
  const [keyword, setKeyword] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Navigate to the search results page with the keyword
      window.location.href = `/search/${keyword}`;
    } else {
      // If no keyword, navigate to the home page
      window.location.href = '/';
    }
  };

  return (
    <Form onSubmit={submitHandler}>
      <Form.Control
        type='text'
        name='q'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            submitHandler(e);
          }
        }}
        placeholder='Search products...'
        className='mr-sm-2 ml-sm-5'
        aria-label='Search Products'
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Button type='submit' variant='outline-success' className='p-2'>
        Search
      </Button>
    </Form>
  );
};

export default SearchBox;
