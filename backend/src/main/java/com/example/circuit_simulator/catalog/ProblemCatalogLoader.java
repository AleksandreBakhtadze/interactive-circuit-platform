package com.example.circuit_simulator.catalog;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLGenerator;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * Loads {@code classpath:problems/*.yaml} into a {@link ProblemCatalog}.
 */
@Component
public class ProblemCatalogLoader {

    public static final String CLASSPATH_PATTERN = "classpath:problems/*.yaml";

    private final ObjectMapper yamlMapper;
    private final ProblemCatalog catalog;

    public ProblemCatalogLoader() {
        this.yamlMapper = createYamlMapper();
        this.catalog = loadCatalog(yamlMapper);
    }

    public ProblemCatalog getCatalog() {
        return catalog;
    }

    public ObjectMapper yamlMapper() {
        return yamlMapper;
    }

    public static ObjectMapper createYamlMapper() {
        YAMLFactory factory = new YAMLFactory()
                .disable(YAMLGenerator.Feature.WRITE_DOC_START_MARKER)
                .enable(YAMLGenerator.Feature.MINIMIZE_QUOTES)
                .enable(YAMLGenerator.Feature.LITERAL_BLOCK_STYLE);
        ObjectMapper mapper = new ObjectMapper(factory);
        mapper.findAndRegisterModules();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper;
    }

    public static ProblemCatalog loadCatalog(ObjectMapper yamlMapper) {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources(CLASSPATH_PATTERN);
            Arrays.sort(resources, Comparator.comparing(Resource::getFilename, Comparator.nullsLast(String::compareTo)));
            List<ChapterCatalogFile> files = new ArrayList<>();
            for (Resource resource : resources) {
                if (!resource.exists() || !resource.isReadable()) {
                    continue;
                }
                try (InputStream in = resource.getInputStream()) {
                    ChapterCatalogFile file = yamlMapper.readValue(in, ChapterCatalogFile.class);
                    if (file.getChapter() == null || file.getChapter().isBlank()) {
                        String name = resource.getFilename();
                        if (name != null && name.endsWith(".yaml")) {
                            file.setChapter(name.substring(0, name.length() - ".yaml".length()));
                        }
                    }
                    files.add(file);
                }
            }
            return new ProblemCatalog(files);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load problem catalog from " + CLASSPATH_PATTERN, e);
        }
    }
}
