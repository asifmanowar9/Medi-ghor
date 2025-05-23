import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  Image,
  Spinner,
  Alert,
  ProgressBar,
} from 'react-bootstrap';
import { FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import Message from '../components/Message';
import { getChatDetails } from '../actions/chatActions';
import { addMessage } from '../actions/chatActions';
import { analyzeImage } from '../actions/chatActions';
import ReactMarkdown from 'react-markdown';
import './ChatScreen.css';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const messagesEndRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: chatId } = useParams();

  // Get user info from state
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Get chat details from state
  const chatDetails = useSelector((state) => state.chatDetails);
  const { loading, error, chat = {} } = chatDetails;

  // Get chat message add status
  const chatMessageAdd = useSelector((state) => state.chatMessageAdd) || {};
  const { loading: loadingAddMessage = false } = chatMessageAdd;

  // Get image analysis status
  const chatImageAnalyze = useSelector((state) => state.chatImageAnalyze) || {};
  const {
    loading: loadingAnalysis = false,
    analysis = null,
    imageUrl = null,
  } = chatImageAnalyze;

  // Analysis loaded state
  const [analysisLoaded, setAnalysisLoaded] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(getChatDetails(chatId));
    }
  }, [dispatch, navigate, chatId, userInfo]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current && chat.messages) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages]);

  // Reset analysis progress when uploadingImage changes to false
  useEffect(() => {
    if (!uploadingImage) {
      setTimeout(() => {
        setAnalysisProgress(0);
      }, 2000);
    }
  }, [uploadingImage]);

  const submitMessageHandler = (e) => {
    e.preventDefault();
    if (message.trim()) {
      dispatch(addMessage(chatId, message));
      setMessage('');
    }
  };

  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(
        'Please upload a valid image file (JPEG, PNG, GIF, WEBP)'
      );
      return;
    }

    // Clear any previous error
    setErrorMessage('');
    setAnalysisProgress(10);

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setAnalysisProgress(25);
    };
    reader.readAsDataURL(file);

    // Upload and analyze
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    // Add a user message indicating image upload, skip automatic AI response
    dispatch(
      addMessage(
        chatId,
        "I've uploaded a medical test report for analysis.",
        true
      )
    )
      .then(() => {
        setAnalysisProgress(40);
        // Now upload the image for analysis
        return dispatch(analyzeImage(formData));
      })
      .then((data) => {
        setAnalysisProgress(75);
        if (data && data.analysis) {
          // Show the completion animation
          setAnalysisLoaded(true);
          setAnalysisProgress(100);

          // Wait a moment before adding the message
          setTimeout(() => {
            // Add AI's analysis response as a message from AI
            dispatch(addMessage(chatId, data.analysis, false)).then(() => {
              setPreviewImage('');
              setAnalysisLoaded(false);
              // Scroll to bottom after analysis is added
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            });
          }, 1500);
          return data;
        }
        throw new Error('No analysis data received');
      })
      .catch((err) => {
        console.error('Error in image analysis flow:', err);
        setErrorMessage('Failed to analyze the image. Please try again.');
        setAnalysisProgress(0);
        dispatch(
          addMessage(
            chatId,
            "Sorry, I couldn't analyze this image. Please try uploading a clearer image of the test report.",
            false
          )
        );
      })
      .finally(() => {
        setTimeout(() => {
          setUploadingImage(false);
        }, 1000);
      });
  };

  // Render markdown content
  const renderMessageContent = (content) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  };

  // Update the return section of your component
  return (
    <div className='chat-container'>
      <Card className='chat-card'>
        <Card.Header>
          <h2>Medical Test Report Analysis</h2>
        </Card.Header>

        <div className='messages-container'>
          {loading ? (
            <div className='text-center p-4'>
              <Spinner animation='border' />
            </div>
          ) : error ? (
            <div className='p-3'>
              <Message variant='danger'>{error}</Message>
            </div>
          ) : (
            <ListGroup variant='flush' className='chat-messages'>
              {/* Initial system message */}
              <ListGroup.Item className='ai-message'>
                <strong>AI Assistant</strong>
                <div className='message-content'>
                  <p>
                    Welcome to the Medical Test Report Analysis service. Upload
                    images of your medical test reports for analysis.
                  </p>
                </div>
              </ListGroup.Item>

              {/* Chat messages */}
              {chat.messages &&
                chat.messages.map((msg, index) => (
                  <ListGroup.Item
                    key={index}
                    className={
                      msg.sender === 'ai' ? 'ai-message' : 'user-message'
                    }
                  >
                    <strong>
                      {msg.sender === 'user' ? userInfo.name : 'AI Assistant'}
                    </strong>
                    <div className='message-content'>
                      {renderMessageContent(msg.content)}
                    </div>
                  </ListGroup.Item>
                ))}

              {/* Loading indicators */}
              {loadingAddMessage && (
                <ListGroup.Item className='text-center p-2'>
                  <Spinner animation='border' size='sm' /> Sending message...
                </ListGroup.Item>
              )}

              {/* Analysis specific loading indicator */}
              {loadingAnalysis && (
                <ListGroup.Item className='ai-message p-2'>
                  <strong>AI Assistant</strong>
                  <div className='message-content'>
                    <p>
                      <Spinner animation='border' size='sm' /> Processing your
                      medical test report. This may take a moment depending on
                      the complexity...
                    </p>
                  </div>
                </ListGroup.Item>
              )}

              {/* Analysis progress bar */}
              {uploadingImage && analysisProgress > 0 && (
                <ListGroup.Item className='p-2'>
                  <p className='mb-1 small text-muted'>
                    {analysisProgress < 40 && 'Preparing report...'}
                    {analysisProgress >= 40 &&
                      analysisProgress < 75 &&
                      'Analyzing medical data...'}
                    {analysisProgress >= 75 && 'Finalizing results...'}
                  </p>
                  <ProgressBar
                    animated
                    now={analysisProgress}
                    label={`${analysisProgress}%`}
                    variant={analysisProgress < 100 ? 'info' : 'success'}
                  />
                </ListGroup.Item>
              )}

              {/* Analysis completion indicator with animation */}
              {analysisLoaded && (
                <ListGroup.Item className='text-center p-3'>
                  <div className='analysis-complete-indicator'>
                    <div className='checkmark-circle'>
                      <div className='checkmark-stem'></div>
                      <div className='checkmark-kick'></div>
                    </div>
                    <p>Analysis Complete!</p>
                  </div>
                </ListGroup.Item>
              )}

              {/* Image preview with potential analysis */}
              {previewImage && (
                <ListGroup.Item className='p-2'>
                  <small className='text-muted'>Test Report Image:</small>
                  <div className='text-center'>
                    <Image
                      src={previewImage}
                      alt='Preview'
                      fluid
                      className='preview-image'
                    />
                  </div>
                </ListGroup.Item>
              )}

              {/* Show analysis result with the analyzed image */}
              {!uploadingImage && analysis && imageUrl && (
                <ListGroup.Item className='p-2'>
                  <div className='d-flex'>
                    <div className='flex-shrink-0 mr-3'>
                      <Image
                        src={imageUrl}
                        alt='Analyzed Test Report'
                        style={{ maxHeight: '80px' }}
                        className='uploaded-image'
                      />
                    </div>
                    <div className='flex-grow-1'>
                      <strong className='text-success'>Analysis Summary</strong>
                      <p className='small text-muted mb-0'>
                        Adding detailed results to chat...
                      </p>
                    </div>
                  </div>
                </ListGroup.Item>
              )}

              {/* Error message */}
              {errorMessage && (
                <ListGroup.Item className='p-2'>
                  <Alert variant='danger' className='mb-0 py-2'>
                    {errorMessage}
                  </Alert>
                </ListGroup.Item>
              )}

              {/* Reference for scrolling */}
              <div ref={messagesEndRef} />
            </ListGroup>
          )}
        </div>

        <Card.Footer>
          <Form onSubmit={submitMessageHandler}>
            <Row className='align-items-center'>
              <Col xs={9} md={10}>
                <Form.Control
                  type='text'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder='Type your message here...'
                  disabled={uploadingImage || loadingAddMessage}
                />
              </Col>
              <Col xs={3} md={2} className='d-flex'>
                <div className='upload-btn-wrapper'>
                  <Button
                    variant='outline-secondary'
                    size='sm'
                    disabled={uploadingImage || loadingAddMessage}
                  >
                    <FaPaperclip />
                  </Button>
                  <input
                    type='file'
                    onChange={uploadFileHandler}
                    disabled={uploadingImage || loadingAddMessage}
                    accept='image/*'
                  />
                </div>
                <Button
                  type='submit'
                  variant='primary'
                  size='sm'
                  disabled={
                    !message.trim() || uploadingImage || loadingAddMessage
                  }
                >
                  <FaPaperPlane />
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default ChatScreen;
