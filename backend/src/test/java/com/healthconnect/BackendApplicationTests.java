package com.healthconnect;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestRepositoryConfig.class)
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
