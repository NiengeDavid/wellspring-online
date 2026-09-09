// Barrel export for all server actions

export { toggleCourseCompletion } from "./courses";
export { deleteImage, uploadImage } from "./images";
export { toggleLessonCompletion } from "./lessons";
export { getMuxSignedToken, getMuxSignedTokens } from "./mux";
export {
  acceptInvite,
  approveIncomingRequest,
  denyIncomingRequest,
  getChildActivity,
  getIncomingParentRequests,
  getParentDashboardData,
  inviteChild,
  removeChildLink,
} from "./parent";
export {
  getQuizForTaking,
  getStudentQuizActivity,
  submitQuizAttempt,
} from "./quizzes";
