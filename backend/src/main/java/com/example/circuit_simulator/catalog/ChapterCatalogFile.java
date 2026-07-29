package com.example.circuit_simulator.catalog;

import com.example.circuit_simulator.validation.ProblemValidationSpec;
import com.example.circuit_simulator.validation.ValidationCase;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.List;

/**
 * One chapter YAML file under {@code classpath:problems/*.yaml}.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ChapterCatalogFile {

    private String chapter;
    private List<CatalogProblem> problems = new ArrayList<>();

    public String getChapter() {
        return chapter;
    }

    public void setChapter(String chapter) {
        this.chapter = chapter;
    }

    public List<CatalogProblem> getProblems() {
        return problems;
    }

    public void setProblems(List<CatalogProblem> problems) {
        this.problems = problems != null ? problems : new ArrayList<>();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public static class CatalogProblem {
        private String code;
        private String title;
        private int displayOrder;
        private String difficulty = "beginner";
        private String description;
        private String hint;
        private String questions;
        private String methodology;
        private CatalogValidation validation;

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public int getDisplayOrder() {
            return displayOrder;
        }

        public void setDisplayOrder(int displayOrder) {
            this.displayOrder = displayOrder;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty != null && !difficulty.isBlank() ? difficulty : "beginner";
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getHint() {
            return hint;
        }

        public void setHint(String hint) {
            this.hint = hint;
        }

        public String getQuestions() {
            return questions;
        }

        public void setQuestions(String questions) {
            this.questions = questions;
        }

        public String getMethodology() {
            return methodology;
        }

        public void setMethodology(String methodology) {
            this.methodology = methodology;
        }

        public CatalogValidation getValidation() {
            return validation;
        }

        public void setValidation(CatalogValidation validation) {
            this.validation = validation;
        }

        public ProblemValidationSpec toValidationSpec() {
            if (validation == null || validation.getCases() == null || validation.getCases().isEmpty()) {
                return null;
            }
            return new ProblemValidationSpec(code, validation.getCases());
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public static class CatalogValidation {
        private List<ValidationCase> cases = new ArrayList<>();

        public List<ValidationCase> getCases() {
            return cases;
        }

        public void setCases(List<ValidationCase> cases) {
            this.cases = cases != null ? cases : new ArrayList<>();
        }

        public static CatalogValidation fromSpec(ProblemValidationSpec spec) {
            if (spec == null || spec.cases() == null || spec.cases().isEmpty()) {
                return null;
            }
            CatalogValidation v = new CatalogValidation();
            v.setCases(spec.cases());
            return v;
        }
    }
}
