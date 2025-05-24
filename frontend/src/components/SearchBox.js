import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

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
    <Form onSubmit={submitHandler} className='d-flex'>
      <InputGroup>
        <Form.Control
          type='text'
          name='q'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submitHandler(e);
            }
          }}
          placeholder='Search products...'
          aria-label='Search Products'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button type='submit' variant='outline-success'>
          <i className='fas fa-search'></i>
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBox;
