package com.example.circuit_simulator.service;

import com.example.circuit_simulator.model.Component;
import com.example.circuit_simulator.repository.ComponentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComponentService {
    private final ComponentRepository componentRepository;

    public List<Component> getAllComponents() {
        return componentRepository.findAll();
    }

    public Component getComponentById(Long id) {
        return componentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Component not found with id: " + id));
    }

    public Component getComponentByName(String name) {
        return componentRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Component not found with name: " + name));
    }

    public List<Component> getComponentsByType(String type) {
        return componentRepository.findByType(type);
    }

    public Component createComponent(Component component) {
        if (componentRepository.findByName(component.getName()).isPresent()) {
            throw new RuntimeException("Component with name " + component.getName() + " already exists");
        }
        return componentRepository.save(component);
    }

    public Component updateComponent(Long id, Component updatedComponent) {
        Component component = getComponentById(id);
        component.setName(updatedComponent.getName());
        component.setType(updatedComponent.getType());
        component.setSpiceModel(updatedComponent.getSpiceModel());
        component.setPinCount(updatedComponent.getPinCount());
        component.setDefaultValue(updatedComponent.getDefaultValue());
        return componentRepository.save(component);
    }

    public void deleteComponent(Long id) {
        if (!componentRepository.existsById(id)) {
            throw new RuntimeException("Component not found with id: " + id);
        }
        componentRepository.deleteById(id);
    }
}
 