import { defineQuery } from "next-sanity";

export const FEATURED_COURSES_QUERY = defineQuery(`*[
  _type == "course"
  && featured == true
] | order(_createdAt desc)[0...6] {
  _id,
  title,
  slug,
  description,
  tier,
  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  "moduleCount": count(modules),
  "lessonCount": count(modules[]->lessons[])
}`);

export const ALL_COURSES_QUERY = defineQuery(`*[
  _type == "course"
] | order(_createdAt desc) {
  _id,
  title,
  slug,
  description,
  tier,
  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  "moduleCount": count(modules),
  "lessonCount": count(modules[]->lessons[])
}`);

export const COURSE_BY_ID_QUERY = defineQuery(`*[
  _type == "course"
  && _id == $id
][0] {
  _id,
  title,
  slug,
  description,
  tier,
  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  category-> {
    _id,
    title
  },
  modules[]-> {
    _id,
    title,
    description,
    lessons[]-> {
      _id,
      title,
      slug
    }
  }
}`);

export const COURSE_BY_SLUG_QUERY = defineQuery(`*[
  _type == "course"
  && slug.current == $slug
][0] {
  _id,
  title,
  slug,
  description,
  tier,
  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  category-> {
    _id,
    title
  },
  modules[]-> {
    _id,
    title,
    description,
    lessons[]-> {
      _id,
      title,
      slug
    }
  }
}`);

export const STATS_QUERY = defineQuery(`{
  "courseCount": count(*[_type == "course"]),
  "lessonCount": count(*[_type == "lesson"])
}`);

export const DASHBOARD_COURSES_QUERY = defineQuery(`*[
  _type == "course"
] | order(_createdAt desc) {
  _id,
  title,
  slug,
  description,
  tier,
  featured,
  completedBy,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  category-> {
    _id,
    title
  },
  modules[]-> {
    lessons[]-> {
      completedBy
    }
  },
  "moduleCount": count(modules),
  "lessonCount": count(modules[]->lessons[])
}`);

export const COURSE_WITH_MODULES_QUERY = defineQuery(`*[
  _type == "course"
  && slug.current == $slug
][0] {
  _id,
  title,
  slug,
  description,
  tier,
  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  category-> {
    _id,
    title
  },
  modules[]-> {
    _id,
    title,
    description,
    completedBy,
    "quiz": *[_type == "quiz" && module._ref == ^._id][0] { _id, title, completedBy },
    lessons[]-> {
      _id,
      title,
      slug,
      description,
      completedBy,
      "quiz": *[_type == "quiz" && lesson._ref == ^._id][0] { _id, title, completedBy },
      video {
        asset-> {
          playbackId
        }
      }
    }
  },
  completedBy,
  "quiz": *[_type == "quiz" && course._ref == ^._id][0] { _id, title },
  "moduleCount": count(modules),
  "lessonCount": count(modules[]->lessons[]),
  "completedLessonCount": count(modules[]->lessons[]->completedBy[@==$userId])
}`);

export const LESSON_BY_ID_QUERY = defineQuery(`*[
  _type == "lesson"
  && _id == $id
][0] {
  _id,
  title,
  slug,
  description,
  video {
    asset-> {
      playbackId,
      status,
      data {
        duration
      }
    }
  },
  content,
  completedBy,
  "quiz": *[_type == "quiz" && lesson._ref == ^._id][0] { _id, title },
  "courses": *[_type == "course" && ^._id in modules[]->lessons[]->_id] | order(
    select(tier == "free" => 0, tier == "pro" => 1, tier == "ultra" => 2)
  ) {
    _id,
    title,
    slug,
    tier,
    modules[]-> {
      _id,
      title,
      "quiz": *[_type == "quiz" && module._ref == ^._id][0] { _id, title, completedBy },
      lessons[]-> {
        _id,
        title,
        slug,
        completedBy,
        "quiz": *[_type == "quiz" && lesson._ref == ^._id][0] { _id, title, completedBy }
      }
    }
  }
}`);

export const LESSON_BY_SLUG_QUERY = defineQuery(`*[
  _type == "lesson"
  && slug.current == $slug
][0] {
  _id,
  title,
  slug,
  description,
  video {
    asset-> {
      playbackId,
      status,
      data {
        duration
      }
    }
  },
  content,
  completedBy,
  "quiz": *[_type == "quiz" && lesson._ref == ^._id][0] { _id, title },
  "courses": *[_type == "course" && ^._id in modules[]->lessons[]->_id] | order(
    select(tier == "free" => 0, tier == "pro" => 1, tier == "ultra" => 2)
  ) {
    _id,
    title,
    slug,
    tier,
    modules[]-> {
      _id,
      title,
      "quiz": *[_type == "quiz" && module._ref == ^._id][0] { _id, title, completedBy },
      lessons[]-> {
        _id,
        title,
        slug,
        completedBy,
        "quiz": *[_type == "quiz" && lesson._ref == ^._id][0] { _id, title, completedBy }
      }
    }
  }
}`);

// Server-only: includes correct-answer fields (isCorrect, acceptableAnswers, authored
// item/pair order). Never expose this query's result directly to the client — use
// getQuizForTaking() in lib/actions/quizzes.ts to get a sanitized version instead.
export const QUIZ_FULL_BY_ID_QUERY = defineQuery(`*[
  _type == "quiz"
  && _id == $id
][0] {
  _id,
  title,
  passingScorePercent,
  completedBy,
  "tier": coalesce(
    course->tier,
    *[_type == "course" && references(^.module._id)][0].tier,
    *[_type == "course" && ^.lesson._id in modules[]->lessons[]->_id][0].tier,
    "free"
  ),
  lesson-> { _id, "slug": slug.current, completedBy },
  module-> {
    _id,
    lessons[]-> {
      _id,
      completedBy,
      "quiz": *[_type == "quiz" && lesson._ref == ^._id][0] { completedBy }
    }
  },
  course-> { _id, "slug": slug.current },
  questions[] {
    _key,
    _type,
    prompt,
    points,
    options[] { _key, text, isCorrect },
    acceptableAnswers,
    items[] { _key, text },
    pairs[] { _key, left, right }
  }
}`);

export const QUIZ_LATEST_ATTEMPT_QUERY = defineQuery(`*[
  _type == "quizAttempt"
  && quiz._ref == $quizId
  && student == $studentId
] | order(completedAt desc)[0] {
  scorePercent,
  passed,
  totalPointsAwarded,
  answers[] { questionKey, isCorrect, pointsAwarded }
}`);

export const QUIZ_ATTEMPTS_FOR_STUDENT_QUERY = defineQuery(`*[
  _type == "quizAttempt"
  && student == $studentId
] | order(completedAt desc) {
  _id,
  quiz-> { _id, title },
  scorePercent,
  passed,
  totalPointsAwarded,
  completedAt
}`);

export const POINTS_TRANSACTIONS_FOR_STUDENT_QUERY = defineQuery(`*[
  _type == "pointsTransaction"
  && student == $studentId
] | order(_createdAt desc) {
  _id,
  amount,
  type,
  note,
  _createdAt
}`);

export const LESSON_NAVIGATION_QUERY = defineQuery(`*[
  _type == "course"
  && $lessonId in modules[]->lessons[]->_id
][0] {
  _id,
  title,
  tier,
  modules[]-> {
    _id,
    title,
    lessons[]-> {
      _id,
      title
    }
  }
}`);
