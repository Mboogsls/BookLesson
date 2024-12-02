<template>
  <div>
    <select v-model="sortAttribute" @change="sortLessons">
      <option value="subject">Subject</option>
      <option value="location">Location</option>
      <option value="price">Price</option>
      <option value="spaces">Spaces</option>
    </select>

    <div v-for="lesson in sortedLessons" :key="lesson._id">
      <div>{{ lesson.subject }} - {{ lesson.location }} - {{ lesson.price }} - Spaces: {{ lesson.spaces }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lessons: [],
      sortAttribute: 'subject',
      sortedLessons: [],
    };
  },
  mounted() {
    this.fetchLessons();
  },
  methods: {
    async fetchLessons() {
      const response = await fetch('http://localhost:5000/lessons');
      this.lessons = await response.json();
      this.sortLessons();
    },
    sortLessons() {
      this.sortedLessons = [...this.lessons].sort((a, b) => {
        if (typeof a[this.sortAttribute] === 'string') {
          return a[this.sortAttribute].localeCompare(b[this.sortAttribute]);
        }
        return a[this.sortAttribute] - b[this.sortAttribute];
      });
    }
  }
};
</script>
