import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  ListGroup,
  Card,
  Button,
  Form,
  Image,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  getChatDetails,
  addMessage,
  analyzeImage,
} from '../actions/chatActions';
import ReactMarkdown from 'react-markdown';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef();
  const messagesEndRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: chatId } = useParams();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const chatDetails = useSelector((state) => state.chatDetails);
  const { loading, error, chat } = chatDetails;

  const chatMessageAdd = useSelector((state) => state.chatMessageAdd);
  const { loading: loadingAddMessage } = chatMessageAdd;

  const chatImageAnalyze = useSelector((state) => state.chatImageAnalyze);
  const { loading: loadingAnalysis, analysis, imageUrl } = chatImageAnalyze;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(getChatDetails(chatId));
    }
  }, [dispatch, navigate, chatId, userInfo]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages]);

  const submitMessageHandler = (e) => {
    e.preventDefault();
    if (message.trim()) {
      dispatch(addMessage(chatId, message));
      setMessage('');
    }
  };

  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload and analyze
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      dispatch(analyzeImage(formData))
        .then((data) => {
          if (data && data.analysis) {
            // Add user's upload message
            dispatch(
              addMessage(chatId, `I've uploaded a test report for analysis.`)
            ).then(() => {
              // Add AI's response with analysis
              dispatch(addMessage(chatId, data.analysis));
              setPreviewImage('');
            });
          }
        })
        .finally(() => {
          setUploadingImage(false);
        });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <Link to='/chats' className='btn btn-light my-3'>
        Go Back
      </Link>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <h1>Test Report Analysis</h1>
          <Row>
            <Col md={8}>
              <Card>
                <Card.Header>Chat</Card.Header>
                <Card.Body style={{ height: '500px', overflowY: 'auto' }}>
                  {chat.messages && chat.messages.length === 0 ? (
                    <Message>
                      Start the conversation by sending a message or uploading a
                      test report.
                    </Message>
                  ) : (
                    <ListGroup variant='flush'>
                      {chat.messages.map((msg, index) => (
                        <ListGroup.Item
                          key={index}
                          className={msg.sender === 'ai' ? 'bg-light' : ''}
                        >
                          <strong>
                            {msg.sender === 'user' ? 'You' : 'AI Assistant'}
                          </strong>
                          <p className='mt-2'>
                            {msg.image && (
                              <Image
                                src={msg.image}
                                alt='Uploaded test report'
                                fluid
                                className='mb-2'
                              />
                            )}
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </p>
                          <small className='text-muted'>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </small>
                        </ListGroup.Item>
                      ))}
                      <div ref={messagesEndRef} />
                    </ListGroup>
                  )}
                </Card.Body>
                <Card.Footer>
                  <Form onSubmit={submitMessageHandler}>
                    <Row>
                      <Col>
                        <Form.Control
                          type='text'
                          placeholder='Type your message...'
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          disabled={loadingAddMessage || uploadingImage}
                        />
                      </Col>
                      <Col xs='auto'>
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={triggerFileInput}
                          disabled={loadingAddMessage || uploadingImage}
                        >
                          <i className='fas fa-file-upload'></i>
                        </Button>
                        <input
                          type='file'
                          ref={fileInputRef}
                          onChange={uploadFileHandler}
                          style={{ display: 'none' }}
                          accept='image/*'
                        />
                      </Col>
                      <Col xs='auto'>
                        <Button
                          type='submit'
                          disabled={
                            !message.trim() ||
                            loadingAddMessage ||
                            uploadingImage
                          }
                        >
                          Send
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Footer>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>Upload Test Report</Card.Header>
                <Card.Body>
                  <p>
                    Upload a picture of your medical test report, and our AI
                    will analyze it for you.
                  </p>
                  <Button
                    onClick={triggerFileInput}
                    variant='primary'
                    className='btn-block'
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Analyzing...' : 'Upload Test Report'}
                  </Button>

                  {previewImage && (
                    <div className='mt-3'>
                      <h5>Preview:</h5>
                      <Image src={previewImage} alt='Preview' fluid />
                    </div>
                  )}

                  {uploadingImage && (
                    <div className='mt-3'>
                      <Loader />
                      <p className='text-center'>
                        Analyzing your test report...
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ChatScreen;
