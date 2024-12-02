<template>
  <div>
    <input v-model="searchQuery" placeholder="Search lessons" />
    <div v-for="lesson in filteredLessons" :key="lesson._id">
      <p>{{ lesson.subject }} - {{ lesson.location }} - {{ lesson.price }} - Spaces: {{ lesson.spaces }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lessons: [],
      searchQuery: '',
    };
  },
  computed: {
    filteredLessons() {
      return this.lessons.filter(lesson => {
        return lesson.subject.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               lesson.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               lesson.price.toString().includes(this.searchQuery) ||
               lesson.spaces.toString().includes(this.searchQuery);
      });
    }
  },
  mounted() {
    this.fetchLessons();
  },
  methods: {
    async fetchLessons() {
      const response = await fetch('https://localhost:5000/lessons');
      this.lessons = await response.json();
    }
  }
};
</script>
