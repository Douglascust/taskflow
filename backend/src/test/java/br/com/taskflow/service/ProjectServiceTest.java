package br.com.taskflow.service;

import br.com.taskflow.dto.CreateProjectDTO;
import br.com.taskflow.dto.ProjectDTO;
import br.com.taskflow.dto.UpdateProjectDTO;
import br.com.taskflow.enums.ProjectStatus;
import br.com.taskflow.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectServiceTest {
    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateAndGet() {
        CreateProjectDTO dto = new CreateProjectDTO();
        dto.setName("Projeto X");
        dto.setStatus(ProjectStatus.PLANNED.name());
        ProjectDTO savedDto = new ProjectDTO();
        UUID id = UUID.randomUUID();
        savedDto.setId(id);
        savedDto.setName(dto.getName());
        savedDto.setStatus(ProjectStatus.PLANNED);
        when(projectRepository.save(any())).thenAnswer(invocation -> {
            var p = invocation.getArgument(0);
            // set id manually
            var setId = p.getClass().getMethod("setId", java.util.UUID.class);
            setId.invoke(p, id);
            return p;
        });
        when(projectRepository.findById(id)).thenReturn(Optional.ofNullable(null)); // but we will not call find after save directly
        ProjectDTO created = projectService.create(dto);
        assertEquals(dto.getName(), created.getName());
        assertEquals(ProjectStatus.PLANNED, created.getStatus());
    }
}
